## Purpose

Covers moving a deal through the sales pipeline on the board: dragging a card between stage columns, the feedback the user gets before the server confirms, recovery when a move fails, the keyboard path that must stay equivalent, and confirming the loss of a deal.

## ADDED Requirements

### Requirement: A deal moves between stages in one gesture

A deal card SHALL be draggable from its current stage column to any other stage column in a single pointer gesture, using mouse, trackpad, touch, or pen. A move SHALL NOT require one interaction per intervening stage.

#### Scenario: Dragging a deal from the first stage to the last

- **WHEN** the user presses on a card in the `lead` column, drags it onto the `won` column, and releases
- **THEN** the card is shown in the `won` column, and the deal's stage is recorded as `won` after the server confirms, having required exactly one gesture

#### Scenario: Dragging to an adjacent stage

- **WHEN** the user drags a card from `meeting` and releases it over `proposal`
- **THEN** the card is shown in the `proposal` column and the deal's stage is recorded as `proposal`

#### Scenario: Releasing outside any stage column

- **WHEN** the user drags a card and releases it over an area that is not a stage column
- **THEN** the card returns to the column it started in, and no stage change is sent to the server

#### Scenario: The drop target is identified during the drag

- **WHEN** the user drags a card so that the pointer is over a stage column other than its origin
- **THEN** that column is visually distinguished as the pending drop target while the pointer remains over it, and the distinction is removed when the pointer leaves it

#### Scenario: Touch drag on a 390px viewport

- **WHEN** a user on a 390px-wide touch viewport presses a card, drags it onto a visible stage column, and lifts their finger
- **THEN** the card moves to that column, and the page itself does not scroll vertically in response to the drag gesture

#### Scenario: Drag direction in a right-to-left layout

- **WHEN** a Hebrew-locale user views the board
- **THEN** the stage columns are ordered from `lead` at the inline start to `won` at the inline end under `rtl`, and dragging a card toward the inline end advances it to a later stage

### Requirement: A stage move is shown before the server confirms it

On release, the card SHALL appear in its new column immediately, before the server has confirmed. The board SHALL NOT block interaction or dim its controls while a move is in flight.

#### Scenario: The card moves on release

- **WHEN** the user releases a dragged card over a new stage column
- **THEN** the card renders in the new column within 100 milliseconds of release, without waiting for a server response

#### Scenario: Controls stay usable during a move

- **WHEN** a stage move is in flight
- **THEN** the other cards on the board remain draggable, and no control on the board is rendered at reduced opacity to indicate a pending state

#### Scenario: Column totals update with the move

- **WHEN** a card worth 5,000 is moved from a column totalling 12,000 to a column totalling 3,000
- **THEN** immediately after release the origin column shows 7,000 with its count reduced by one and the target column shows 8,000 with its count raised by one, and these figures still match after the server confirms

### Requirement: A failed stage move is reverted and reported

If the server rejects or fails to record a stage move, the card SHALL return to the stage it came from, and the user SHALL be told the move did not save.

#### Scenario: The server rejects the move

- **WHEN** the server responds to a stage move with an error
- **THEN** the card returns to its original column, its original column total is restored, and a message in Hebrew states that the change was not saved

#### Scenario: The network fails mid-move

- **WHEN** the connection drops after the card has been optimistically moved and before a response arrives
- **THEN** the card returns to its original column within 15 seconds and a message in Hebrew states that the change was not saved

#### Scenario: The user's session has expired

- **WHEN** a stage move is attempted with an expired session
- **THEN** the card returns to its original column, and the user is told to sign in again rather than being shown a generic failure

### Requirement: Every stage move is available from the keyboard

A stage move SHALL be achievable without a pointer. Keyboard and assistive-technology users SHALL have a path to move a deal forward, backward, and to mark it lost, and that path SHALL remain visible.

#### Scenario: Moving a deal forward with the keyboard

- **WHEN** a keyboard user focuses a card's advance control and activates it
- **THEN** the deal moves to the next stage, with the same optimistic display and the same failure handling as a drag

#### Scenario: Focus is visible on card controls

- **WHEN** a keyboard user tabs to a control on a deal card
- **THEN** that control shows a visible focus ring of at least 2 pixels against the card surface

#### Scenario: Reduced motion

- **WHEN** a user whose operating system reports `prefers-reduced-motion: reduce` moves a deal between columns
- **THEN** the card appears in its new position without an animated transition, and no spring or reflow animation runs

#### Scenario: A card announces its stage

- **WHEN** a screen-reader user reaches a deal card
- **THEN** the card's accessible name includes the deal title and the name of the stage column it currently sits in

### Requirement: Marking a deal lost is confirmed before it takes effect

Marking a deal as lost SHALL require an explicit confirmation, because it removes the deal from the pipeline view and is not reachable by a drag.

#### Scenario: Cancelling the loss

- **WHEN** the user activates the lost control on a deal and then dismisses the confirmation
- **THEN** the deal stays in its current stage, and no change is sent to the server

#### Scenario: Confirming the loss

- **WHEN** the user activates the lost control on a deal and confirms
- **THEN** the deal's status is recorded as `lost`, the card is removed from the stage columns, and the column's count and total are reduced accordingly

#### Scenario: The confirmation names the deal

- **WHEN** the confirmation for marking a deal lost is shown
- **THEN** it states the title of the deal being marked lost, so the user can tell which card they activated

#### Scenario: Confirmation on a 390px viewport

- **WHEN** the confirmation is shown in a 390px-wide viewport
- **THEN** both the confirm and dismiss controls are fully visible without scrolling, and each is at least 44 pixels tall
