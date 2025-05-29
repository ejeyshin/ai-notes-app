resource "aws_cognito_user_pool" "user_pool" {
  name = "ai-notes-user-pool"

  auto_verified_attributes = ["email"]

  username_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = true
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = false
    require_numbers   = true
    require_symbols   = false
  }
}

resource "aws_cognito_user_pool_client" "app_client" {
  name         = "ai-notes-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = false

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]

  callback_urls = ["http://localhost:3000/"]
  logout_urls   = ["http://localhost:3000/"]

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}
