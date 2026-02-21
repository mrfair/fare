# Organisms

Large sections, mainly `section`-level areas, that compose molecules/atoms and can be dropped into pages.
Each organism should expose configuration (props/slots) so it’s reusable across domains.

## A) App Shell / Navigation
- **AppHeader / TopBar** – brand + nav links + actions.
- **BottomNav / TabBar** – stacked nav buttons for mobile.
- **SideNav / DrawerNav** – collapsible nav + active link states.
- **BreadcrumbBar** – row of `BreadcrumbItem` molecules.
- **SectionTabs** – tab row with active indicator.

## B) Search & Filter
- **SearchBar** – search field + filter trigger.
- **Autocomplete / Combobox** – input with dropdown suggestions.
- **MultiSelect** – chips + dropdown for selections.
- **FilterPanel** – facets + apply/reset controls.
- **SortMenu** – sort options in a popover.
- **ResultsSummaryBar** – count + active filters summary.

## C) List & Feed
- **ItemList** – list with loading/empty states, each row built from `ListItem`.
- **CardGrid** – matrix of cards.
- **InfiniteScrollFeed** – paginated loader + skeleton placeholders.
- **SectionedList** – grouped list by date/category.
- **CarouselRow** – horizontal scroll list.

## D) Data display
- **DataTable** – sortable/filterable table with actions.
- **KeyValuePanel** – detail panel showing label:value pairs.
- **Timeline** – vertical timeline with steps/events.
- **Stepper / StepIndicator** – progress indicator for flows.
- **StatsCardsRow** – row of statistic cards.

## E) Forms & Flows
- **FormSection** – grouped form fields (title, layout).
- **MultiStepForm** – wizard flow using `FormField`, steps, progress controls.
- **Uploader** – file/image uploader component.
- **VerificationBlock** – OTP entry + resend/timer.
- **ConsentBlock** – checkbox + links for legal consent.

## F) Overlays & Transient
- **Modal**
- **Drawer / BottomSheet**
- **Popover**
- **ToastSystem**
- **NotificationCenter**

## G) System states
- **LoadingSection** – skeleton layout, placeholder structure.
- **EmptyStateSection**
- **ErrorStateSection**
- **OfflineBanner**
- **PermissionRequestBlock**

Organisms can manage state/logic (toggle, fetch, permission). Keep them configurable (slots/events) to promote reuse.
