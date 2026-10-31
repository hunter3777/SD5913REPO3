# PROCESS

## 1. Starting Idea

The project concept is a theatre acoustic design game inspired by the
interaction style of Squiggle Drop. Players draw a roof in a theatre
cross-section and test whether sound can reach the audience.

> **Write in your own words:** Why did you choose this project? What did you
> hope players would explore or learn? Note any changes you made to the original
> idea.

## 2. Design Decisions

The current interface has a light architectural style. The theatre cross
section places the stage and sound source on the left and rows of seats on a
sloping floor to the right. Markers show where roof drawing starts and ends.
Players use a mouse or other pointer to draw the roof and click **TEST SOUND**
to run the simulation.

The game uses a simplified 2D ray model. Seats are covered when a reflected ray
passes within the detection radius. The success threshold is 60% coverage.

> **Add during development:** Describe the visual and interaction alternatives
> you considered, why you selected this design, and any gameplay decisions you
> revised.

## 3. Development Process

### Project setup

The project is a small static web app, with `index.html`, `style.css`, and
`script.js` in the project root.

> **Add:** Record how you organised the project, which tools you used, and any
> setup problems you encountered.

### HTML and CSS interface

The HTML contains the title, instructions, Canvas, controls, coverage display,
warning, and result dialogs. The CSS provides the architectural styling,
responsive layout, and button and modal states.

> **Add:** Explain interface decisions and accessibility considerations. Note
> any changes made after trying the page at different screen sizes.

### Canvas theatre drawing

JavaScript draws the theatre in a 1000 by 560 Canvas coordinate system.
Separate functions draw the background, stage, source, floor, seats, and roof
markers.

> **Add:** Describe how you organised and refined the drawing code.

### Mouse-based roof drawing

Pointer Events record roof points while the player presses and drags from the
start marker. Pointer coordinates are converted to Canvas coordinates, and
drawing is constrained to the roof area.

> **Add:** Record how you tested drawing, resizing, and attempts to draw outside
> the allowed area, including any issues you fixed.

### Sound reflection simulation

The sound test creates 20 rays at different upward angles. It checks each ray
against the roof segments, finds the first intersection, and calculates a
reflected direction. A ray that misses the roof continues without reflection.

> **Add:** Explain how you checked the intersection and reflection behaviour.
> Describe the model's simplifications rather than presenting it as physically
> accurate acoustics.

### Audience seat detection

Each seat has a Canvas position and a coverage state. The scoring code checks
whether any reflected ray passes within the seat detection radius. Each seat
can only count once.

> **Add:** Explain how you chose or tuned the detection radius and how you
> checked that unreflected rays do not count.

### Game result system

When a sound test completes, the game compares seat coverage with the 60%
target and displays a success or failure modal with the percentage. A warning
appears if the player tries to test before drawing a valid roof. Restart
controls clear the roof, rays, and seat states.

> **Add:** Record how you tested both result paths, invalid-roof handling, and
> restart behaviour.

## 4. Design and Code Changes

Use this table to document important changes and why you made them. Add rows
when needed.

| Change | Reason | Evidence or result |
| --- | --- | --- |
| _Describe a change_ | _Why was it needed?_ | _How did you verify it?_ |

> List only changes that were actually made. Mark planned work as planned.

## 5. User Testing

Complete this section after a real participant has tried the game. Keep their
identity anonymous and omit identifying details.

- **Testing participant:** _Use an anonymous label, such as “Participant A”._
- **What the participant tried:** _Describe the tasks they attempted._
- **Where they hesitated:** _Record observed hesitation or uncertainty; do not
  infer it without evidence._
- **What I observed:** _Record actions and comments accurately._
- **Problems discovered:** _List problems found during the session._
- **Testing context:** _Add the date or development stage, device, and browser
  if relevant._

## 6. Improvements After Testing

Use actual participant feedback and observations to explain what you changed
or retained and why. Do not write this as completed work before testing.

| Feedback or observation | Change made or retained | Reason |
| --- | --- | --- |
| _Add actual feedback_ | _Describe the change or decision_ | _Explain why_ |

> If testing has not happened yet, leave this as a prompt. If you choose not to
> act on feedback, explain your reasoning.

## 7. AI Tools and Assistance

An AI coding assistant in VS Code was used in this development conversation to
help create and revise project code and documentation. Check your course rules
and make sure this description matches the assistance you actually used.

- **AI tools used:** _Confirm the tool name and list any others you used._
- **How each tool was used:** _Describe the specific tasks and what you
  reviewed or changed._
- **One AI suggestion I kept:** _Describe a suggestion you actually adopted
  and why it was useful._
- **One AI suggestion I modified or rejected:** _Describe a suggestion you
  actually changed or did not use, and explain why._

> Complete the last two items from your own decisions; do not invent examples.

## 8. Reflection

> **Write after development:** What did you learn about Canvas, pointer input,
> geometry, testing, or software documentation? What was most challenging? What
> would you improve if you continued developing Echo Architect?
