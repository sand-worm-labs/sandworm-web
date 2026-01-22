export enum ErrorCode {
  // Common Validation
  V000 = 'app.common.validation.error',
  V001 = 'app.common.validation.is_empty',
  V002 = 'app.common.validation.is_invalid',

  // Generic User Errors
  E001 = 'app.user.username_or_email_exists',
  E002 = 'app.user.not_found',

  // Document Errors
  E003 = 'app.document.not_found',
  E004 = 'app.document.not_authorized_to_delete',
  E005 = 'app.document.not_authorized_to_update',
  E006 = 'app.document.already_exists',

  // Profile Errors
  E101 = 'app.profile.not_found',
  E102 = 'app.profile.following_self',
  E103 = 'app.profile.already_followed',
  E104 = 'app.profile.not_followed',

  // Article Errors
  E201 = 'app.article.not_found',

  // Comment Errors
  E301 = 'app.comment.not_found',
  E302 = 'app.comment.not_authorized_to_delete',
  E303 = 'app.comment.not_authorized_to_update',
  E304 = 'app.comment.invalid_document',
  E305 = 'app.comment.user_not_found',

  // Environment Errors
  E401 = 'app.environment.not_found',
  E402 = 'app.environment.create_failed',
  E403 = 'app.environment.restart_failed',
  E404 = 'app.environment.invalid_variable',
  E405 = 'app.environment.variable_not_found',
  E406 = 'app.environment.variable_sync_failed',
  E407 = 'app.environment.variable_save_failed',

  // Tutorial Errors
  E500 = 'app.tutorial.not_started',
  E501 = 'app.tutorial.not_found',
  E502 = 'app.tutorial.invalid_type',
  E503 = 'app.tutorial.state_not_found',
  E504 = 'app.tutorial.cannot_advance',
  E505 = 'app.tutorial.not_complete',
  E506 = 'app.tutorial.already_dismissed',
  E507 = 'app.tutorial.step_not_found',

  // Schedule Errors
  E600 = 'app.schedule.falied_to_create',
};