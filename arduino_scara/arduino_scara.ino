// SCARA Robot Control Firmware for Arduino Mega
// Controls 4 stepper motors and a magnet end effector

#include <AccelStepper.h>

// Define stepper motor pins
// Motor 0: Base Rotation
#define MOTOR0_STEP_PIN 2
#define MOTOR0_DIR_PIN 3
#define MOTOR0_ENABLE_PIN 4

// Motor 1: Shoulder
#define MOTOR1_STEP_PIN 5
#define MOTOR1_DIR_PIN 6
#define MOTOR1_ENABLE_PIN 7

// Motor 2: Elbow
#define MOTOR2_STEP_PIN 8
#define MOTOR2_DIR_PIN 9
#define MOTOR2_ENABLE_PIN 10

// Motor 3: Z-Axis
#define MOTOR3_STEP_PIN 11
#define MOTOR3_DIR_PIN 12
#define MOTOR3_ENABLE_PIN 13

// Magnet pin
#define MAGNET_PIN 53

// Create stepper instances
AccelStepper stepper0(AccelStepper::DRIVER, MOTOR0_STEP_PIN, MOTOR0_DIR_PIN);
AccelStepper stepper1(AccelStepper::DRIVER, MOTOR1_STEP_PIN, MOTOR1_DIR_PIN);
AccelStepper stepper2(AccelStepper::DRIVER, MOTOR2_STEP_PIN, MOTOR2_DIR_PIN);
AccelStepper stepper3(AccelStepper::DRIVER, MOTOR3_STEP_PIN, MOTOR3_DIR_PIN);

// Array of stepper pointers for easier access
AccelStepper* steppers[4] = {&stepper0, &stepper1, &stepper2, &stepper3};

// Variables for command parsing
String inputString = "";
boolean stringComplete = false;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println("SCARA Robot Control System");
  Serial.println("Ready to receive commands");
  
  // Reserve memory for input string
  inputString.reserve(64);
  
  // Configure stepper motors
  for (int i = 0; i < 4; i++) {
    steppers[i]->setMaxSpeed(1000);    // Maximum speed in steps per second
    steppers[i]->setAcceleration(500); // Acceleration in steps per second per second
    steppers[i]->disableOutputs();     // Disable outputs initially to save power
  }
  
  // Configure enable pins
  pinMode(MOTOR0_ENABLE_PIN, OUTPUT);
  pinMode(MOTOR1_ENABLE_PIN, OUTPUT);
  pinMode(MOTOR2_ENABLE_PIN, OUTPUT);
  pinMode(MOTOR3_ENABLE_PIN, OUTPUT);
  
  // Configure magnet pin
  pinMode(MAGNET_PIN, OUTPUT);
  digitalWrite(MAGNET_PIN, LOW); // Magnet off initially
  
  // Disable all motors initially
  disableAllMotors();
}

void loop() {
  // Process any complete commands
  if (stringComplete) {
    processCommand(inputString);
    
    // Clear the string for the next command
    inputString = "";
    stringComplete = false;
  }
  
  // Run the steppers
  for (int i = 0; i < 4; i++) {
    if (steppers[i]->isRunning()) {
      steppers[i]->run();
    } else {
      // Disable motor when not moving to save power
      if (digitalRead(getEnablePin(i)) == LOW) {
        digitalWrite(getEnablePin(i), HIGH); // HIGH disables the motor (depends on your driver)
      }
    }
  }
}

// Process incoming serial data
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    // Add character to input string
    if (inChar != '\n') {
      inputString += inChar;
    }
    // End of command
    else {
      stringComplete = true;
    }
  }
}

// Process the received command
void processCommand(String command) {
  // Trim any whitespace
  command.trim();
  
  // Check if it's a magnet command
  if (command.startsWith("M,")) {
    // Format: M,STATE (1 or 0)
    int commaIndex = command.indexOf(',');
    if (commaIndex != -1) {
      String stateStr = command.substring(commaIndex + 1);
      int state = stateStr.toInt();
      
      // Set magnet state
      digitalWrite(MAGNET_PIN, state ? HIGH : LOW);
      
      // Send response
      Serial.print("Magnet ");
      Serial.println(state ? "activated" : "deactivated");
    }
    return;
  }
  
  // Parse motor command
  // Format: MOTOR_INDEX,STEPS,DIRECTION,SPEED
  int firstComma = command.indexOf(',');
  int secondComma = command.indexOf(',', firstComma + 1);
  int thirdComma = command.indexOf(',', secondComma + 1);
  
  if (firstComma != -1 && secondComma != -1 && thirdComma != -1) {
    int motorIndex = command.substring(0, firstComma).toInt();
    long steps = command.substring(firstComma + 1, secondComma).toInt();
    int direction = command.substring(secondComma + 1, thirdComma).toInt();
    long speed = command.substring(thirdComma + 1).toInt();
    
    // Validate motor index
    if (motorIndex >= 0 && motorIndex < 4) {
      // Enable the motor
      digitalWrite(getEnablePin(motorIndex), LOW); // LOW enables the motor (depends on your driver)
      
      // Set direction and speed
      steppers[motorIndex]->setSpeed(1000000 / speed); // Convert delay in µs to steps per second
      
      // Set target position
      long targetPosition = direction == 0 ? steps : -steps;
      steppers[motorIndex]->move(targetPosition);
      
      // Send response
      Serial.print("Moving Motor ");
      Serial.print(motorIndex);
      Serial.print(": ");
      Serial.print(steps);
      Serial.print(" steps ");
      Serial.print(direction == 0 ? "CW" : "CCW");
      Serial.print(" at ");
      Serial.print(speed);
      Serial.println("µs delay");
    } else {
      Serial.println("Invalid motor index");
    }
  } else {
    Serial.println("Invalid command format");
  }
}

// Get the enable pin for a specific motor
int getEnablePin(int motorIndex) {
  switch (motorIndex) {
    case 0: return MOTOR0_ENABLE_PIN;
    case 1: return MOTOR1_ENABLE_PIN;
    case 2: return MOTOR2_ENABLE_PIN;
    case 3: return MOTOR3_ENABLE_PIN;
    default: return -1;
  }
}

// Disable all motors to save power
void disableAllMotors() {
  digitalWrite(MOTOR0_ENABLE_PIN, HIGH);
  digitalWrite(MOTOR1_ENABLE_PIN, HIGH);
  digitalWrite(MOTOR2_ENABLE_PIN, HIGH);
  digitalWrite(MOTOR3_ENABLE_PIN, HIGH);
}