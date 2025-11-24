export enum ErrorCode {
  // Common Validation
  V000 = 'app.common.validation.error',
  V001 = 'app.common.validation.is_empty',
  V002 = 'app.common.validation.is_invalid',

  // Generic Errors
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
}
