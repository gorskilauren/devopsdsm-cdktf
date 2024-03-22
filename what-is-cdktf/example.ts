import { OrganizationsAccount } from '@cdktf/provider-aws/lib/organizations-account';
import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

class MyConvertedCode extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // cdktf example (written in ts)
    new OrganizationsAccount(this, 'account', {
      name: 'my_new_account',
      email: 'john@doe.org'
    });

    // cdktf concat two arrays and loop through them
    const alwaysDefinedList = ['prod'];
    const optionallyDefinedList = ['sandbox', 'nonprod'];
    alwaysDefinedList.concat(optionallyDefinedList).map(
      (accountName) =>
        new OrganizationsAccount(this, `${accountName}-account`, {
          email: `${accountName}@devops-dsm.com`,
          name: accountName
        })
    );
  }
}
