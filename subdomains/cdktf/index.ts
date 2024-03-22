require('dotenv').config();

import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { RefactorStack } from './RefactorStack';

class CdktfHostedZonesStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // import hosted zone in production AWS Account for "root" domain (talktalk.dev)
    const prodProvider = new AwsProvider(this, 'prod', {
      region: 'us-west-2',
      allowedAccountIds: [process.env.DEVOPS_DSM_PROD_ACCOUNT_ID],
      profile: 'devopsdsm-prod',
      alias: 'prod'
    });

    const prodHostedZone = new DataAwsRoute53Zone(this, 'talktalk-prod', {
      provider: prodProvider,
      name: 'talktalk.dev'
    });

    // import hosted zone in sandbox AWS Account for subdomain (sandbox.talktalk.dev)
    const sandboxProvider = new AwsProvider(this, 'sandbox', {
      region: 'us-west-2',
      allowedAccountIds: [process.env.DEVOPS_DSM_SANDBOX_ACCOUNT_ID],
      profile: 'devopsdsm-sandbox',
      alias: 'sandbox'
    });

    const sandboxHostedZone = new DataAwsRoute53Zone(this, 'talktalk-sandbox', {
      provider: sandboxProvider,
      name: 'sandbox.talktalk.dev'
    });

    // link sandbox.talktalk.dev => talktalk.dev
    new Route53Record(this, 'talktalk-sandbox-ns-records', {
      zoneId: prodHostedZone.zoneId,
      name: 'sandbox.talktalk.dev',
      ttl: 300,
      type: 'NS',
      records: sandboxHostedZone.nameServers,
      provider: prodProvider
    });
  }
}

const app = new App();
new CdktfHostedZonesStack(app, 'CdktfHostedZonesStack');
// new RefactorStack(app, 'CdktfHostedZonesStack');
app.synth();
