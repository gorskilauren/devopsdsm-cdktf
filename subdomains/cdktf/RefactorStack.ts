require('dotenv').config();

import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';

export class RefactorStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // import hosted zone in production AWS Account for "root" domain (talktalk.dev)
    const { provider: prodProvider, hostedZone: prodHostedZone } =
      this.importHostedZone('prod');

    // import hosted zone in sandbox AWS Account for subdomain (sandbox.talktalk.dev)
    const { provider: _, hostedZone: sandboxHostedZone } =
      this.importHostedZone('sandbox');

    // link sandbox.talktalk.dev => talktalk.dev
    new Route53Record(this, 'talktalk-sandbox-ns-records', {
      zoneId: prodHostedZone.zoneId,
      name: sandboxHostedZone.name,
      ttl: 300,
      type: 'NS',
      records: sandboxHostedZone.nameServers,
      provider: prodProvider
    });
  }

  importHostedZone = (alias: 'prod' | 'sandbox') => {
    const provider = new AwsProvider(this, alias, {
      region: 'us-west-2',
      allowedAccountIds: [
        process.env[`DEVOPS_DSM_${alias.toUpperCase()}_ACCOUNT_ID`]
      ],
      profile: `devopsdsm-${alias}`,
      alias
    });

    const hostedZone = new DataAwsRoute53Zone(this, `talktalk-${alias}`, {
      provider: provider,
      name: alias === 'prod' ? 'talktalk.dev' : `${alias}.talktalk.dev`
    });

    return {
      provider,
      hostedZone
    };
  };
}
