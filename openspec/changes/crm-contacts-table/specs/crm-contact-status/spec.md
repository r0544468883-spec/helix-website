## MODIFIED Requirements

### Requirement: Each status is visually distinct and never signalled by colour alone

In both the light and the dark theme, each of the nine statuses SHALL render as a chip whose colour treatment differs from all eight others, and every chip SHALL always carry its Hebrew label as text. Each chip's label SHALL measure at least 4.5:1 against the chip's own fill in both themes. `paid` SHALL be the only green chip, `new` the only chip with no fill, and `frozen` the only chip with a dashed border, in both themes. Status SHALL be the only element of a contact-list row that uses colour to carry meaning. The contact list SHALL NOT show the lead score, and the `hot`/`warm`/`cold` word SHALL NOT appear in it.

#### Scenario: Nine statuses are told apart without reading

- **WHEN** a contact list holds at least one contact in each of the nine statuses
- **THEN** each row's status chip is distinguishable from the other eight by its colour treatment alone, and no two of the nine share the same treatment

#### Scenario: A colour-blind operator can still read every status

- **WHEN** the contact list renders with colour perception unavailable, simulated by forcing greyscale
- **THEN** every row's status is still readable from the chip's Hebrew text, and no row's status depends on hue to be identified

#### Scenario: A paying client is not also labelled cold

- **WHEN** a contact with status `paid` has a lead score below 40
- **THEN** the row shows the `שולם` chip as its only coloured element, no score, and the word `cold` nowhere

#### Scenario: Nine statuses in the light theme

- **WHEN** the contact list shows a contact in each of the nine statuses in the light theme
- **THEN** no two chips share a treatment, `שולם` is the only green chip, `ליד חדש` has no fill, `בהקפאה` has a dashed border, and every label measures at least 4.5:1 against its fill

#### Scenario: A status chip at 390px in the light theme

- **WHEN** the list renders at 390px wide in the light theme with a contact whose status is `הצעה נשלחה`
- **THEN** the chip stays on one line, fully inside the viewport, with its label legible against its pale fill

### Requirement: Status renders correctly in Hebrew and at a phone width

Every status chip SHALL render right-to-left in Hebrew with its label intact, SHALL keep Latin and numeric fragments in a mixed row readable left-to-right, and SHALL remain fully visible at a 390px viewport.

#### Scenario: A mixed Hebrew, Latin and numeric row

- **WHEN** the list renders a contact named `דנה כהן` at company `Nurit Ltd` with email `dana@nurit.co.il`, last touched 12 days ago and status `הצעה נשלחה`
- **THEN** the Hebrew name and chip read right-to-left, the company and the email read left-to-right, the 12 in "לפני 12 ימים" keeps its digits in order, and no character of the chip label is clipped or reordered

#### Scenario: A long Hebrew status in a narrow row

- **WHEN** the list renders at 390px wide with a contact whose status is `הצעה נשלחה` and whose name wraps to two lines
- **THEN** the chip stays on one line, remains fully within the viewport, and the row does not scroll horizontally
