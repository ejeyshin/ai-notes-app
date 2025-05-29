resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "summarize_note" {
  filename         = "${path.module}/index.zip"
  function_name    = "summarizeNote"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/index.zip")
  
  
  timeout     = 30
  memory_size = 256
}

resource "aws_iam_role_policy" "bedrock_invoke_policy" {
  name = "allow-bedrock-invoke"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "bedrock:InvokeModel"
        ],
        Resource = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      }
    ]
  })
}

resource "aws_iam_role_policy" "dynamodb_write_policy" {
  name = "allow-dynamodb-write"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "dynamodb:PutItem",
          "dynamodb:Query"
        ],
        Resource = aws_dynamodb_table.notes.arn
      }
    ]
  })
}

resource "aws_lambda_function" "save_note" {
  filename         = "${path.module}/saveNote.zip"
  function_name    = "saveNote"
  handler          = "saveNote.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/saveNote.zip")
  
  timeout     = 15
  memory_size = 256
}

resource "aws_lambda_function" "get_notes" {
  filename         = "${path.module}/getNotes.zip"
  function_name    = "getNotes"
  handler          = "getNotes.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/getNotes.zip")
  
  timeout     = 15
  memory_size = 256
}

resource "aws_lambda_function" "edit_note" {
  filename         = "${path.module}/editNote.zip"
  function_name    = "editNote"
  handler          = "editNote.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/editNote.zip")
  
 
  timeout     = 30
  memory_size = 256
}

resource "aws_lambda_function" "delete_note" {
  filename         = "${path.module}/deleteNote.zip"
  function_name    = "deleteNote"
  handler          = "deleteNote.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/deleteNote.zip")
  
  timeout     = 15
  memory_size = 256
}

resource "aws_iam_role_policy" "lambda_delete_note_policy" {
  name = "lambda-delete-note-policy"
  role = aws_iam_role.lambda_exec_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "dynamodb:DeleteItem"
        ],
        Resource = "arn:aws:dynamodb:us-east-1:253239971635:table/ai_notes"
      }
    ]
  })
}


resource "aws_lambda_function" "edit_summary_beginner" {
  filename         = "${path.module}/editSummaryAndBeginner.zip"
  function_name    = "editSummaryAndBeginner"
  handler          = "editSummaryAndBeginner.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/editSummaryAndBeginner.zip")
  
  timeout     = 15
  memory_size = 256
}


resource "aws_iam_role_policy" "dynamodb_update_policy" {
  name = "allow-dynamodb-update"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "dynamodb:UpdateItem"
        ],
        Resource = aws_dynamodb_table.notes.arn
      }
    ]
  })
}



resource "aws_lambda_function" "text_to_speech" {
  filename         = "${path.module}/textToSpeech.zip"
  function_name    = "textToSpeech"
  handler          = "textToSpeech.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/textToSpeech.zip")
  
  timeout     = 30
  memory_size = 512
}


resource "aws_iam_role_policy" "polly_policy" {
  name = "allow-polly-synthesize"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "polly:SynthesizeSpeech"
        ],
        Resource = "*"
      }
    ]
  })
}