require('dotenv').config();
import { App } from 'aws-cdk-lib';
import AwsCdkHostedZonesStack from './AwsCdkHostedZonesStack';
import Route53RoleStack from './Route53RoleStack';

const app = new App();

const route53RoleName = 'aws-cdk-cross-account-route-53';

/* 
Stack deployed to Prod Account
Create Role in Prod Account that trusts Sandbox Account 
*/
new Route53RoleStack(app, 'AwsCdkRoute53RoleStack', {
  env: {
    account: process.env.DEVOPS_DSM_PROD_ACCOUNT_ID,
    region: 'us-west-2'
  },
  route53RoleName
});

/* 
Stack deployed to Sandbox Account
Use Prod Role and Custom Resource to add Sandbox HZ NS Records to Prod HZ
 */
new AwsCdkHostedZonesStack(app, 'AwsCDKHostedZonesStack', {
  env: {
    account: process.env.DEVOPS_DSM_SANDBOX_ACCOUNT_ID,
    region: 'us-west-2'
  },
  route53RoleName
});

app.synth();
