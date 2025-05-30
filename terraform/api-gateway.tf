resource "aws_apigatewayv2_api" "api" {
  name          = "summarizeNoteAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    expose_headers = ["Content-Type"]
    max_age = 3600
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.summarize_note.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "summarize" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /summarizeNote"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      integration    = "$context.integrationStatus"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.summarize_note.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/summarizeNoteAPI"
  retention_in_days = 7
}



resource "aws_apigatewayv2_integration" "save_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.save_note.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "save" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /saveNote"
  target    = "integrations/${aws_apigatewayv2_integration.save_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_save" {
  statement_id  = "AllowExecutionFromAPIGatewaySave"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.save_note.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "get_notes_lambda" {
  api_id                = aws_apigatewayv2_api.api.id
  integration_type      = "AWS_PROXY"
  integration_uri       = aws_lambda_function.get_notes.invoke_arn
  integration_method    = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_notes" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /getNotes"
  target    = "integrations/${aws_apigatewayv2_integration.get_notes_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_get_notes" {
  statement_id  = "AllowExecutionFromAPIGatewayGetNotes"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_notes.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "edit_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.edit_note.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "edit" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /editNote"
  target    = "integrations/${aws_apigatewayv2_integration.edit_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_edit" {
  statement_id  = "AllowExecutionFromAPIGatewayEdit"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.edit_note.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "delete_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.delete_note.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delete" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /deleteNote"
  target    = "integrations/${aws_apigatewayv2_integration.delete_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_delete" {
  statement_id  = "AllowExecutionFromAPIGatewayDelete"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_note.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}



resource "aws_apigatewayv2_integration" "edit_summary_beginner_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.edit_summary_beginner.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "edit_summary_beginner" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /editSummaryAndBeginner"
  target    = "integrations/${aws_apigatewayv2_integration.edit_summary_beginner_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_edit_summary_beginner" {
  statement_id  = "AllowExecutionFromAPIGatewayEditSummaryBeginner"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.edit_summary_beginner.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}



resource "aws_apigatewayv2_integration" "text_to_speech_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.text_to_speech.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "text_to_speech" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /textToSpeech"
  target    = "integrations/${aws_apigatewayv2_integration.text_to_speech_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_text_to_speech" {
  statement_id  = "AllowExecutionFromAPIGatewayTextToSpeech"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.text_to_speech.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}


resource "aws_apigatewayv2_integration" "textract_lambda" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.textract_image.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "textract" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /textractImage"
  target    = "integrations/${aws_apigatewayv2_integration.textract_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigw_textract" {
  statement_id  = "AllowExecutionFromAPIGatewayTextract"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.textract_image.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}