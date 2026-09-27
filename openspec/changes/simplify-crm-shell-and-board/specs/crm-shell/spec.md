## Purpose

Defines what belongs to the CRM as an application: which screens are CRM screens, what chrome those screens render, how the primary action is distinguished from occasional settings, and where a link out of a CRM screen leads.

## ADDED Requirements

### Requirement: CRM screens render CRM chrome only

A CRM screen SHALL render the navigation bar, the screen content, and the footer. It SHALL NOT render decorative or cross-sell surfaces belonging to the directory product: the cursor-trail particle canvas, the floating animated logo layer, the product-compare tray, and the refer-and-earn pill. Scrolling on a CRM screen SHALL use the browser's native scrolling, without smooth-scroll interception.

#### Scenario: Board renders without directory chrome

- **WHEN** a signed-in user with a workspace loads `/he/dashboard/crm`
- **THEN** the page contains no cursor-trail canvas element, no floating logo layer, no compare tray, and no refer-and-earn pill, and the rendered surfaces are the navigation bar, the board, and the footer

#### Scenario: Native scrolling on the contact list

- **WHEN** the user scrolls the contact list on `/he/dashboard/crm` with a trackpad
- **THEN** the page scrolls at the operating system's scroll position with no interception layer, and the scroll position after the gesture ends does not continue to drift

#### Scenario: Directory pages keep their existing chrome

- **WHEN** a user loads `/he/launches`
- **THEN** the cursor-trail canvas, the floating logo layer, the compare tray, and the refer-and-earn pill all render as they do today

#### Scenario: CHIEF is a CRM screen

- **WHEN** a signed-in user loads `/he/chief`
- **THEN** the page renders without the cursor-trail canvas, the floating logo layer, the compare tray, or the refer-and-earn pill

#### Scenario: Every existing URL still resolves

- **WHEN** an HTTP GET is issued for each of `/he/dashboard/crm`, `/he/dashboard/crm/team`, `/he/dashboard/crm/api`, `/he/dashboard/crm/autonomy`, `/he/chief`, `/he/launches`, and `/he/categories`
- **THEN** each returns HTTP 200 with the same page it returns today, and none returns a redirect introduced by this change

#### Scenario: Board on a 390px viewport

- **WHEN** a signed-in user loads `/he/dashboard/crm` in a 390px-wide viewport
- **THEN** the page does not scroll horizontally, and the metric cards, contact rows, and stage columns each stay inside the viewport width

#### Scenario: Hebrew text direction on the board

- **WHEN** a signed-in user whose locale is `he` loads `/he/dashboard/crm`
- **THEN** the document direction is `rtl`, the contact score sits at the inline start of each row, the lifecycle pill sits at the inline end, and a contact whose name is 60 Hebrew characters wraps inside its row without overlapping the pill

### Requirement: Navigation out of a CRM screen stays in the CRM

A link that leaves a CRM screen SHALL lead to another CRM screen. No CRM screen SHALL link to the directory product's dashboard, which lists products, launches and waitlist signups and prompts the visitor to become a maker.

#### Scenario: The board's footer link leads to a CRM destination

- **WHEN** a signed-in user activates the navigation link in the footer area of `/he/dashboard/crm`
- **THEN** the resulting page is a CRM screen, and it is not `/he/dashboard`

#### Scenario: A user with no products is not offered the maker prompt

- **WHEN** a signed-in user whose profile has no products navigates only through links present on CRM screens
- **THEN** no screen reached offers to make them a maker or lists product launches

### Requirement: The board header exposes one primary action and one overflow

The board header SHALL present exactly one filled primary action, creating a contact. Team, API keys, autonomy and automations SHALL be reachable from a single overflow control rather than as separate same-weight buttons. Every CRM sub-screen SHALL be reachable without the command palette.

#### Scenario: One filled button in the default header

- **WHEN** a signed-in user loads `/he/dashboard/crm`
- **THEN** the header contains exactly one filled brand-coloured action, labelled for creating a contact, plus the workspace switcher and one overflow control

#### Scenario: Autonomy is reachable without the command palette

- **WHEN** the user opens the header's overflow control
- **THEN** the panel lists destinations for team, API keys, autonomy, and automations, and activating the autonomy entry loads `/he/dashboard/crm/autonomy`

#### Scenario: Overflow closes on Escape and restores focus

- **WHEN** the user presses Escape while the header's overflow panel is open
- **THEN** the panel closes and keyboard focus returns to the overflow control that opened it

#### Scenario: Header on a 390px viewport

- **WHEN** a signed-in user loads `/he/dashboard/crm` in a 390px-wide viewport
- **THEN** the title, workspace switcher, overflow control, and primary action all remain visible and tappable with a minimum touch target of 44 by 44 pixels, and no control is clipped by the viewport edge

#### Scenario: Overflow panel in Hebrew

- **WHEN** a Hebrew-locale user opens the header's overflow panel
- **THEN** the panel's labels read right-to-left, and the panel enters from the inline-start edge for `rtl` rather than from the left edge

### Requirement: Overlay surfaces match the dark application regardless of operating system theme

Panels that float above CRM content — the command palette, sheets, drawers and dialogs — SHALL render as dark surfaces on the CRM's dark background. Their appearance SHALL NOT depend on the viewer's operating system colour-scheme preference, because the CRM has no light theme.

#### Scenario: Command palette on a light-mode operating system

- **WHEN** a user whose operating system reports `prefers-color-scheme: light` opens the command palette on `/he/dashboard/crm`
- **THEN** the palette panel renders as a dark surface against the dark page, and its text remains legible at a contrast ratio of at least 4.5 to 1

#### Scenario: Command palette on a dark-mode operating system

- **WHEN** a user whose operating system reports `prefers-color-scheme: dark` opens the command palette on `/he/dashboard/crm`
- **THEN** the palette panel renders as the same dark surface as it does for a light-mode user

#### Scenario: Reduced transparency

- **WHEN** a user whose operating system reports `prefers-reduced-transparency: reduce` opens the command palette on `/he/dashboard/crm`
- **THEN** the panel renders as a solid dark surface with no backdrop blur, and the content behind it is not visible through it

### Requirement: Contact temperature uses one colour per tier across every screen

A contact's score tier SHALL be styled identically wherever it appears. The warm tier SHALL use the amber hue documented in the CRM design document, and no screen SHALL style the same tier in a different hue.

#### Scenario: Warm tier matches between list and record

- **WHEN** a warm-tier contact is rendered in the board's contact list and on its own record page at `/he/dashboard/crm/<id>`
- **THEN** the tier badge uses the same amber foreground and background on both screens, and no screen renders the tier in yellow
