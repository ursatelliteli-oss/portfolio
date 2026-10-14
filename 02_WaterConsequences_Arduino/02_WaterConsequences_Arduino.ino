#include <Servo.h>

// 02 Water Consequences — three-button serial controller
// Button modules: VCC -> 5V, GND -> GND, OUT -> the pin below.
// This sketch assumes each module's OUT goes HIGH when pressed.
// If your module goes LOW when pressed, change PRESSED_LEVEL to LOW.

const uint8_t RED_BUTTON_PIN = 10;    // Previous water allocation scenario
const uint8_t YELLOW_BUTTON_PIN = 9;  // Next water allocation scenario
const uint8_t GREEN_BUTTON_PIN = 8;   // Confirm current scenario

// SG90 signal wire. Change this if your servo signal is connected elsewhere.
const uint8_t SERVO_SIGNAL_PIN = 6;

const uint8_t PRESSED_LEVEL = HIGH;
const unsigned long DEBOUNCE_MS = 35;

// Website scenario order: Life First, Balanced, Compute First, High Demand.
// The balanced scenario is selected on startup, matching the web page default.
// Adjust these angles to suit the pointer/linkage used in your installation.
const uint8_t SCENARIO_ANGLES[] = {20, 65, 115, 160};
const uint8_t SCENARIO_COUNT = sizeof(SCENARIO_ANGLES) / sizeof(SCENARIO_ANGLES[0]);
uint8_t currentScenario = 1;

struct ButtonState {
  uint8_t pin;
  const char *message;
  int lastReading;
  int stableState;
  unsigned long lastChangeAt;
};

ButtonState buttons[] = {
  {RED_BUTTON_PIN, "RED", LOW, LOW, 0},
  {YELLOW_BUTTON_PIN, "YELLOW", LOW, LOW, 0},
  {GREEN_BUTTON_PIN, "GREEN", LOW, LOW, 0},
};

const uint8_t BUTTON_COUNT = sizeof(buttons) / sizeof(buttons[0]);
Servo scenarioServo;

void sendButtonEvent(const char *message) {
  // The web page reads one command per line at 9600 baud.
  Serial.println(message);
}

void moveServoToScenario() {
  scenarioServo.write(SCENARIO_ANGLES[currentScenario]);
}

void handleButtonPress(uint8_t index) {
  if (index == 0) {
    // Red: previous scenario, wrapping around at either end.
    currentScenario = (currentScenario + SCENARIO_COUNT - 1) % SCENARIO_COUNT;
    moveServoToScenario();
    sendButtonEvent("RED");
  } else if (index == 1) {
    // Yellow: next scenario, wrapping around at either end.
    currentScenario = (currentScenario + 1) % SCENARIO_COUNT;
    moveServoToScenario();
    sendButtonEvent("YELLOW");
  } else {
    // Green: confirm the current scenario. The servo stays at its indicator angle.
    sendButtonEvent("GREEN");
  }
}

void setup() {
  Serial.begin(9600);

  // The button modules provide their own HIGH/LOW output, so use INPUT.
  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    pinMode(buttons[i].pin, INPUT);
    const int reading = digitalRead(buttons[i].pin);
    buttons[i].lastReading = reading;
    buttons[i].stableState = reading;
    buttons[i].lastChangeAt = millis();
  }

  scenarioServo.attach(SERVO_SIGNAL_PIN);
  moveServoToScenario();
}

void loop() {
  const unsigned long now = millis();

  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    ButtonState &button = buttons[i];
    const int reading = digitalRead(button.pin);

    if (reading != button.lastReading) {
      button.lastReading = reading;
      button.lastChangeAt = now;
    }

    if ((now - button.lastChangeAt) >= DEBOUNCE_MS &&
        reading != button.stableState) {
      button.stableState = reading;

      // Send one event on the press edge; holding the button won't repeat it.
      if (button.stableState == PRESSED_LEVEL) {
        handleButtonPress(i);
      }
    }
  }
}
