import {
  App,
  Stack,
  StackProps,
  aws_route53,
  custom_resources,
  aws_logs,
  Fn
} from 'aws-cdk-lib';

interface AwsCdkHostedZonesStackProps extends StackProps {
  route53RoleName: string;
}

export default class AwsCdkHostedZonesStack extends Stack {
  readonly props: AwsCdkHostedZonesStackProps;
  readonly sandboxHostedZone: aws_route53.IHostedZone;
  constructor(app: App, id: string, props: AwsCdkHostedZonesStackProps) {
    super(app, id, props);
    this.props = props;
    this.sandboxHostedZone = aws_route53.HostedZone.fromLookup(
      this,
      'AwsCdkSandboxHostedZone',
      { domainName: 'sandbox.talktalk.dev' }
    );

    new custom_resources.AwsCustomResource(
      this,
      'AwsCdkSandboxCustomResource',
      {
        policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE
        }),
        logRetention: aws_logs.RetentionDays.TWO_WEEKS,
        onCreate: this.createAwsSdkCall('UPSERT'),
        onUpdate: this.createAwsSdkCall('UPSERT'),
        onDelete: this.createAwsSdkCall('DELETE')
      }
    );
  }
  createAwsSdkCall = (action: string) => {
    let resourceRecords: Array<{ Value: string }> = [];

    for (let count = 0; count < 4; count++) {
      resourceRecords.push({
        Value: Fn.select(count, this.sandboxHostedZone.hostedZoneNameServers)
      });
    }

    return {
      assumedRoleArn: `arn:aws:iam::${process.env.DEVOPS_DSM_PROD_ACCOUNT_ID}:role/${this.props.route53RoleName}`,
      service: 'Route53',
      action: 'changeResourceRecordSets',
      physicalResourceId: custom_resources.PhysicalResourceId.of(
        `${action.toLowerCase()}RecordSetsForSandbox`
      ),
      parameters: {
        HostedZoneId: 'Z03898461KPZ8D69MBMMZ', // prod talktalk.dev hosted zone ID
        ChangeBatch: {
          Changes: [
            {
              Action: action.toUpperCase(),
              ResourceRecordSet: {
                Name: this.sandboxHostedZone.zoneName,
                Type: 'NS',
                TTL: 60 * 5,
                ResourceRecords: resourceRecords
              }
            }
          ]
        }
      }
    };
  };
}
