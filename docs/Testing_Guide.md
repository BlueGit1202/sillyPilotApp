# SillyPilot Testing Guide

## Server Connection Testing

### Basic Connectivity
1. Server Status Check
   - Launch app in web browser at localhost:8081
   - Verify server connection status is shown
   - Verify error messages are clear and helpful
   - Test retry functionality

2. Network Handling
   - Test with server running
   - Test with server stopped
   - Verify appropriate error messages
   - Test auto-reconnection

### Platform-Specific Testing
1. Web Platform
   - Test in Chrome, Firefox, Safari
   - Verify CORS handling
   - Test WebSocket connections
   - Verify error messages are web-specific

2. Mobile Platform
   - Test on iOS simulator
   - Test on Android emulator
   - Verify network state handling
   - Test offline mode

## Character Import Testing

### PNG Character Card Import
1. V1 Character Cards
   - Upload V1 PNG with embedded JSON
   - Verify auto-fill of:
     - Character name
     - Avatar image
     - Personality traits
     - Background story
     - Example conversations
   - Verify JSON parsing accuracy

2. V2 Character Cards
   - Upload V2 PNG with embedded JSON
   - Verify enhanced data fields auto-fill
   - Verify extended attributes are preserved

3. Error Handling
   - Test uploading PNG without embedded JSON
   - Test uploading corrupted character cards
   - Test uploading invalid file types
   - Verify appropriate error messages

## Message Functionality Testing

### Basic Messaging
1. Send Message
   - Type a message in the input field
   - Press the send button or hit enter
   - Verify message appears in chat
   - Verify typing indicator shows while waiting for response
   - Verify AI response is received

2. Message History
   - Scroll through message history
   - Verify messages load correctly
   - Verify timestamps are correct
   - Verify message order is maintained

### Message Editing
1. Edit User Message
   - Long press on a user message
   - Click the edit button
   - Verify edit mode is activated (banner appears)
   - Modify message text
   - Click checkmark to save
   - Verify message is updated
   - Verify timestamp is updated

2. Cancel Edit
   - Enter edit mode
   - Click cancel
   - Verify original message remains unchanged
   - Verify input returns to normal state

### Message Regeneration
1. Regenerate AI Response
   - Long press on an AI message
   - Click regenerate button
   - Verify old message is removed
   - Verify typing indicator appears
   - Verify new response is generated
   - Verify chat history updates correctly

### Idle Mode
1. Basic Idle Mode
   - Click idle mode button
   - Configure interval (e.g., 30 seconds)
   - Enable idle mode
   - Verify automatic responses are generated
   - Verify timing matches set interval

2. Idle Mode Settings
   - Open idle mode settings
   - Adjust interval
   - Toggle mode on/off
   - Verify changes take effect
   - Verify persistence across app restarts

### Error Handling
1. Network Issues
   - Turn off internet connection
   - Try sending a message
   - Verify appropriate error message
   - Verify message queue functionality
   - Restore connection and verify sync

2. Invalid Operations
   - Try editing AI message (should not be possible)
   - Try regenerating user message (should not be possible)
   - Verify appropriate feedback is given

## UI/UX Testing

### Visual Feedback
1. Message States
   - Verify typing indicator animation
   - Verify message send animation
   - Verify edit mode visual indicators
   - Verify idle mode status indicator

2. Interactions
   - Verify button press animations
   - Verify message bubble animations
   - Verify smooth scrolling
   - Verify keyboard handling

### Navigation
1. Chat Navigation
   - Verify back button works
   - Verify settings button opens settings
   - Verify character info is displayed correctly
   - Verify navigation state is preserved

### Accessibility
1. Basic Checks
   - Verify text is readable
   - Verify contrast ratios
   - Verify touch targets are adequate size
   - Verify keyboard navigation works

## Data Persistence

### Local Storage
1. Message Persistence
   - Send several messages
   - Close app
   - Reopen app
   - Verify messages are restored
   - Verify message order is maintained

2. Settings Persistence
   - Change various settings
   - Close app
   - Reopen app
   - Verify settings are restored

### Server Sync
1. Multi-device Sync
   - Send messages on one device
   - Open app on another device
   - Verify messages sync correctly
   - Verify real-time updates work

## Performance Testing

### Message Handling
1. Large History
   - Load chat with many messages
   - Verify scrolling performance
   - Verify message loading speed
   - Verify memory usage

2. Rapid Interactions
   - Send messages rapidly
   - Edit messages quickly
   - Verify app remains responsive
   - Verify no message loss

## Known Issues
- None currently documented

## Reporting Issues
When reporting issues, please include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Device/OS information
5. Screenshots if applicable
6. Network logs if relevant

## Version Information
- App Version: [Current Version]
- Last Updated: [Date]
