output "user_pool_id" {
  description = "The Cognito User Pool ID"
  value       = aws_cognito_user_pool.user_pool.id
}

output "user_pool_client_id" {
  description = "The Cognito User Pool Web Client ID"
  value       = aws_cognito_user_pool_client.app_client.id
}

output "api_endpoint" {
  description = "The URL of the deployed API Gateway"
  value       = aws_apigatewayv2_api.api.api_endpoint
}
