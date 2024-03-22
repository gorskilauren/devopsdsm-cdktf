import { App, Stack, StackProps, aws_iam } from 'aws-cdk-lib';
interface Route53RoleProps extends StackProps {
  route53RoleName: string;
}

export default class Route53RoleStack extends Stack {
  constructor(app: App, id: string, props: Route53RoleProps) {
    super(app, id, props);

    new aws_iam.Role(this, 'CrossAccountRoute53Role', {
      roleName: props.route53RoleName,
      assumedBy: new aws_iam.AccountPrincipal(
        process.env.DEVOPS_DSM_SANDBOX_ACCOUNT_ID
      ),
      inlinePolicies: {
        createNsRecord: new aws_iam.PolicyDocument({
          statements: [
            new aws_iam.PolicyStatement({
              effect: aws_iam.Effect.ALLOW,
              actions: [
                'route53:ChangeResourceRecordSets',
                'route53:GetHostedZone'
              ],
              resources: ['arn:aws:route53:::hostedzone/*']
            })
          ]
        })
      }
    });
  }
}
