## MODIFIED Requirements

### Requirement: Each status is visually distinct and never signalled by colour alone

In both the light and the dark theme, each of the nine statuses SHALL render as a chip whose colour treatment differs from all eight others, and every chip SHALL always carry its Hebrew label as text. Each chip's label SHALL measure at least 4.5:1 against the chip's own fill in both themes. `paid` SHALL be the only green chip, `new` the only chip with no fill, and `frozen` the only chip with a dashed border, in both themes. Status SHALL be the only element of a contact-list row that uses colour to carry meaning: the lead score SHALL render as a neutral number and the `hot`/`warm`/`cold` word SHALL NOT appear in a contact-list row.

#### Scenario: Nine statuses are told apart without reading

- **WHEN** a contact list holds at least one contact in each of the nine statuses
- **THEN** each row's status chip is distinguishable from the other eight by its colour treatment alone, and no two of the nine share the same treatment

#### Scenario: A colour-blind operator can still read every status

- **WHEN** the contact list renders with colour perception unavailable, simulated by forcing greyscale
- **THEN** every row's status is still readable from the chip's Hebrew text, and no row's status depends on hue to be identified

#### Scenario: A paying client is not also labelled cold

- **WHEN** a contact with status `paid` has a lead score below 40
- **THEN** the row shows the `שולם` chip as its only coloured element, the score renders as a plain number in a neutral badge, and the word `cold` appears nowhere in that row

#### Scenario: Nine statuses in the light theme

- **WHEN** the contact list shows a contact in each of the nine statuses in the light theme
- **THEN** no two chips share a treatment, `שולם` is the only green chip, `ליד חדש` has no fill, `בהקפאה` has a dashed border, and every label measures at least 4.5:1 against its fill

#### Scenario: A status chip at 390px in the light theme

- **WHEN** the list renders at 390px wide in the light theme with a contact whose status is `הצעה נשלחה`
- **THEN** the chip stays on one line, fully inside the viewport, with its label legible against its pale fill
