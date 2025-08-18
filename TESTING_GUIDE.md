# Portal Frontend Testing Guide

This guide provides comprehensive manual testing scenarios for the portal frontend application.

## Overview

The portal frontend handles authentication for various educational platforms with support for:
- Session-based authentication
- Sessionless authentication
- Multiple authentication types (ID, Phone, Date, Code)
- Signup flows
- Multi-language support

## Backend Requirements

Ensure the portal-backend is running on `127.0.0.1:8000` before testing.

## Testing Scenarios

### 1. Session-Based Authentication

#### 1.1 Open Session with ID Authentication
- **URL**: `http://localhost:8080/?sessionId=PunjabTeachers_11_engg_003_23_45267_-Zm7fGXqNI8&type=sign-in`
- **Expected Backend Calls**:
  - `GET /session-occurrence?session_id=PunjabTeachers_11_engg_003_23_45267_-Zm7fGXqNI8`
  - `GET /session-group/6749`
- **Expected Behavior**:
  - Shows signin form with ID input field

#### 1.2 Closed Session
- **URL**: `http://localhost:8080/?sessionId=CLOSED_SESSION_ID&type=sign-in`
- **Expected Behavior**:
  - Shows "No Class Message" component
  - No signin form displayed
  - By closed, we mean, the session exists but `is_session_open` is `False`.

#### 1.3 Invalid/Non-existent Session
- **URL**: `http://localhost:8080/?sessionId=INVALID_SESSION`
- **Expected Behavior**:
  - Redirects to `/error` page
  - Shows error page component
  - Displays appropriate error message

#### 1.4 Session with Signup Enabled
- **URL**: `http://localhost:8080/?sessionId=PunjabStudents_PunjabStudents_12_24_A001_02108`
- **Expected Behavior**:
  - Shows signin form
  - Displays signup button below signin form
  - Signup button should be clickable

### 2. Sessionless Authentication

#### 2.1 Valid Auth Group
- **URL**: `http://localhost:8080/?platform=gurukul&group=DelhiStudents`
- **URL**: `http://localhost:8080/?type=attendance&redirectTo=report&redirectId=DelhiStudents_688caff6bf2c493ccb8619a7&sub_type=reporting&group=DelhiStudents&auth_type=ID,DOB`
- **Expected Backend Calls**:
  - `GET /auth-group/?name=PunjabTeachers` or `GET /auth-group/?name=DelhiStudents`
- **Expected Behavior**:
  - Shows signin form
  - Form configured based on auth group settings
  - Appropriate input fields based on auth_type
  - Backwards compatible

#### 2.2 Missing Auth Group Parameter
- **URL**: `http://localhost:8080/?platform=gurukul&type=sign-in`
- **Expected Behavior**:
  - Shows error page
  - Error message: "Sessionless URLs require authGroup parameter"

#### 2.3 Invalid Auth Group
- **URL**: `http://localhost:8080/?platform=gurukul&authGroup=INVALID_GROUP&type=sign-in`
- **Expected Behavior**:
  - Shows error page or appropriate error handling
  - Backend returns 404 for invalid auth group

### 3. Landing Page

#### 3.1 No Parameters
- **URL**: `http://localhost:8080/`
- **Expected Behavior**:
  - Shows landing page component
  - No signin form displayed

### 4. Authentication Types Testing

Test with different `auth_type` values in auth group configuration:

#### 4.1 ID Authentication
- Input field for ID entry
- Validation for ID format
- Appropriate labels and placeholders

#### 4.2 Phone Authentication
- Input field for phone number
- Phone number format validation
- Country code handling if applicable

#### 4.3 Date Authentication
- Date picker or date input field
- Date format validation
- Appropriate date constraints

#### 4.4 Code Authentication
- Input field for access code
- Code format validation
- Case sensitivity handling

### 5. Signup Flow Testing

#### 5.1 Signup Button Functionality
- Click signup button from signin page
- Should redirect to signup form
- Form should be pre-populated with session/group context

#### 5.2 Signup Form Completion
- Fill out all required fields
- Submit form and verify backend calls
- Handle validation errors appropriately

### 6. Multi-language Support

#### 6.1 Language Switching
- Test language picker component
- Verify UI updates when language changes
- Ensure all text elements are translated

#### 6.2 Locale-specific Input Parameters
- Verify input labels change with locale
- Check placeholder text translations
- Validate locale-specific input formats

### 7. Error Handling

#### 7.1 Network Errors
- Disconnect from backend
- Verify graceful error handling
- Check error messages are user-friendly

#### 7.2 Invalid Input Data
- Submit forms with invalid data
- Verify client-side validation
- Check server-side validation responses

#### 7.3 Session Timeout
- Test with expired sessions
- Verify appropriate error handling
- Check redirect behavior

### 8. Responsive Design

#### 8.1 Mobile Testing
- Test on mobile device dimensions
- Verify form usability on small screens
- Check button and input sizing

#### 8.2 Desktop Testing
- Test on various desktop resolutions
- Verify layout remains centered and readable
- Check component spacing and alignment

### 9. Backend API Endpoints to Monitor

When testing, monitor these API calls in the backend logs:

- `GET /session-occurrence?session_id={sessionId}` - Session data retrieval
- `GET /session-group/{groupId}` - Session group information
- `GET /auth-group/?name={authGroup}` - Auth group configuration
- `POST /student/verify` - Student authentication
- `POST /teacher/verify` - Teacher authentication
- `POST /user/` - User signup
- `POST /auth/create-access-token` - Token creation

### 10. Common Issues to Watch For

- Authentication parameter validation
- Session state management
- Navigation between pages
- Form submission handling

## Notes

- Always test with backend running on `127.0.0.1:8000`
- Check browser console for any JavaScript errors
- Verify network tab for API call status codes
- Test with different browser types and versions
- Clear browser cache between tests if needed
