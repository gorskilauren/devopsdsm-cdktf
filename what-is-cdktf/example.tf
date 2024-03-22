# terraform example (written in hcl)
resource "aws_organizations_account" "account" {
  name  = "my_new_account"
  email = "john@doe.org"
}

# terraform for_each loop
resource "aws_organizations_account" "account_loop_inline" {
  for_each = toset(["sandbox@devops-dsm.com", "nonprod@devops-dsm.com", "prod@devops-dsm.com"])
  email    = each.value
  name     = split("@", each.value)[0]
}

#terraform concat two arrays and loop through them
locals {
  always_defined_list     = ["prod"]
  optionally_defined_list = ["sandbox", "nonprod"]
  empty_array = []
  combined_list = (length(local.optionally_defined_list) == 0
    ? local.always_defined_list
    : concat(local.always_defined_list,
  local.optionally_defined_list))
}
resource "aws_organizations_account" "account_loop" {
  for_each = toset(concat(local.empty_array, local.combined_list))
  email    = format("%s!@devops-dsm.com", each.value)
  name     = each.value
}