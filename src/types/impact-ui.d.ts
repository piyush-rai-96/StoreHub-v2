declare module 'impact-ui' {
  import type React from 'react';
  import type { FC, ReactNode, CSSProperties, MouseEvent as ReactMouseEvent, ChangeEvent } from 'react';

  export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'primary' | 'secondary' | 'url';
  export type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  export type ButtonSize = 'small' | 'medium' | 'large';

  export interface ButtonProps {
    children?: ReactNode;
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset' | 'destructive' | 'default';
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    fullWidth?: boolean;
    isLoading?: boolean;
    title?: string;
    'aria-label'?: string;
  }

  export const Button: FC<ButtonProps>;

  export type ChipsVariant = 'filled' | 'outlined' | 'stroke' | 'solid';
  export type ChipsColor = 'primary' | 'secondary' | 'default';
  export type ChipsType = 'default' | 'single' | 'multi';

  export interface ChipsProps {
    label: ReactNode;
    variant?: ChipsVariant;
    color?: ChipsColor;
    size?: 'small' | 'medium' | 'large';
    type?: ChipsType;
    isActive?: boolean;
    onClick?: (label?: ReactNode) => void;
    className?: string;
    icon?: ReactNode;
    disabled?: boolean;
    isRemovable?: boolean;
    onDelete?: (e: ReactMouseEvent) => void;
  }

  export const Chips: FC<ChipsProps>;

  export type BadgeColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  export type BadgeSize = 'small' | 'medium' | 'large';

  export interface BadgeProps {
    label: ReactNode;
    color?: BadgeColor;
    size?: BadgeSize;
    variant?: 'default' | 'subtle' | 'filled' | 'stroke';
    isIcon?: boolean;
    icon?: ReactNode;
    className?: string;
    style?: CSSProperties;
    sx?: Record<string, unknown>;
    onClick?: (e: ReactMouseEvent<HTMLDivElement>) => void;
  }

  export const Badge: FC<BadgeProps>;

  export type CardSize =
    | 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge' | 'extraLarge-3x';

  export interface CardProps {
    size?: CardSize;
    children?: ReactNode;
    className?: string;
    sx?: Record<string, unknown>;
    onClick?: (e?: ReactMouseEvent) => void;
    style?: CSSProperties;
  }
  export const Card: FC<CardProps>;

  // ── Modal ────────────────────────────────────────────────────────────────
  export interface ModalProps {
    open: boolean;
    onClose?: () => void;
    title?: ReactNode;
    size?: 'small' | 'medium' | 'large' | 'extraLarge';
    children?: ReactNode;
    className?: string;
    width?: string | number;
    height?: string | number;
    maxHeight?: string | number;
    zIndex?: number;
    primaryButtonLabel?: string;
    primaryButtonProps?: Record<string, unknown>;
    onPrimaryButtonClick?: () => void;
    secondaryButtonLabel?: string;
    secondaryButtonProps?: Record<string, unknown>;
    onSecondaryButtonClick?: () => void;
    footerOptions?: ReactNode;
  }
  export const Modal: FC<ModalProps>;

  // ── Input ────────────────────────────────────────────────────────────────
  export interface InputProps {
    label?: string;
    isRequired?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    leftIconClick?: () => void;
    rightIconClick?: () => void;
    helperText?: string;
    isHelperText?: boolean;
    focusedText?: string;
    isError?: boolean;
    isDisabled?: boolean;
    htmlFor?: string;
    size?: 'small' | 'medium' | 'large';
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    type?: string;
    autoComplete?: string;
    className?: string;
  }
  export const Input: FC<InputProps>;

  // ── Select ───────────────────────────────────────────────────────────────
  export interface SelectOption { label: string; value: string; }
  export interface SelectProps {
    label?: string;
    isRequired?: boolean;
    placeholder?: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialOptions: SelectOption[];
    currentOptions: SelectOption[];
    setCurrentOptions: (opts: SelectOption[]) => void;
    selectedOptions: SelectOption[] | SelectOption | null;
    setSelectedOptions: (opts: SelectOption[] | SelectOption | null) => void;
    setIsSelectAll: (v: boolean) => void;
    isMulti?: boolean;
    isDisabled?: boolean;
    isError?: boolean;
    helperText?: string;
    isWithSearch?: boolean;
    isClearable?: boolean;
    withPortal?: boolean;
    dropDownPortalClassName?: string;
    portalContainer?: Element;
    width?: string | number;
    minWidth?: string | number;
  }
  export const Select: FC<SelectProps>;

  // ── Toast ────────────────────────────────────────────────────────────────
  export interface ToastProps {
    isOpen?: boolean;
    message?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    autoHideDuration?: number;
    onClose?: () => void;
  }
  export const Toast: FC<ToastProps>;

  // ── Avatar ───────────────────────────────────────────────────────────────
  export interface AvatarProps {
    label?: string;
    type?: 'withPicture' | 'withoutPicture' | 'onlyName';
    src?: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
  }
  export const Avatar: FC<AvatarProps>;

  // ── Tooltip ──────────────────────────────────────────────────────────────
  export interface TooltipProps {
    title: ReactNode;
    children: React.ReactElement;
    orientation?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    variant?: 'primary' | 'secondary' | 'tertiary' | 'feature';
    description?: string;
    isHoverEnabled?: boolean;
    className?: string;
  }
  export const Tooltip: FC<TooltipProps>;

  // ── EmptyState ───────────────────────────────────────────────────────────
  export interface EmptyStateProps {
    heading?: ReactNode;
    description?: ReactNode;
    emptyStateIcon?: ReactNode;
    emptyStateBottomOptions?: ReactNode;
    primaryButtonLabel?: string;
    onPrimaryButtonClick?: () => void;
    primaryButtonProps?: Record<string, unknown>;
    secondaryButtonLabel?: string;
    onSecondaryButtonClick?: () => void;
    secondaryButtonProps?: Record<string, unknown>;
  }
  export const EmptyState: FC<EmptyStateProps>;

  // ── Switch ───────────────────────────────────────────────────────────────
  export interface SwitchProps {
    value?: boolean;
    leftLabel?: string;
    rightLabel?: string;
    disabled?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  }
  export const Switch: FC<SwitchProps>;

  // ── Checkbox ─────────────────────────────────────────────────────────────
  export interface CheckboxProps {
    label?: ReactNode;
    variant?: 'default' | 'dashed';
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    withoutFormLabel?: boolean;
    withDropDown?: boolean;
    dropDownData?: Array<{ label: string; value: string; onClick?: () => void; disabled?: boolean }>;
    onDropDownCheckBoxClick?: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }
  export const Checkbox: FC<CheckboxProps>;

  // ── Stepper ──────────────────────────────────────────────────────────────
  export interface StepperStep {
    label: string;
    description?: string;
    statusConfig?: { label: string; color?: string; icon?: ReactNode };
  }
  export interface StepperProps {
    steps: StepperStep[];
    activeStep: number;
    orientation?: 'horizontal' | 'vertical';
    handleStep: (index: number) => void;
    variant?: 'default' | 'progress' | 'mui';
    width?: string | number;
  }
  export const Stepper: FC<StepperProps>;

  // ── Tag ──────────────────────────────────────────────────────────────────
  export interface TagProps {
    label: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'filled' | 'stroke' | 'solid';
    icon?: ReactNode;
    onClick?: () => void;
    isRemovable?: boolean;
    onDelete?: () => void;
  }
  export const Tag: FC<TagProps>;

  export const Header: FC<Record<string, unknown>>;
  export const Sidebar: FC<Record<string, unknown>>;
  export const Breadcrumbs: FC<Record<string, unknown>>;

  export interface TabName {
    value: string;
    label: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    iconPosition?: 'start' | 'end' | 'top' | 'bottom';
  }

  export interface TabsProps {
    tabNames: TabName[];
    tabPanels?: ReactNode[];
    value: string;
    onChange: (event: React.SyntheticEvent, value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    isDisabled?: boolean;
    isBlueBg?: boolean;
    remountOnTabChange?: boolean;
    tabPanelStyle?: CSSProperties;
    className?: string;
  }

  export const Tabs: FC<TabsProps>;

  export interface MenuOption {
    label?: string;
    subLabel?: string;
    icon?: ReactNode;
    rightIcon?: ReactNode;
    value?: string;
    disabled?: boolean;
    section?: string;
    callback?: (event?: React.MouseEvent, item?: MenuOption) => void;
    onClick?: (value?: string, event?: React.MouseEvent) => void;
    children?: MenuOption[];
    sx?: Record<string, unknown>;
  }

  export interface MenuProps {
    options?: MenuOption[];
    anchorEl?: HTMLElement | null;
    open?: boolean;
    onClose?: () => void;
    onClick?: (opt: MenuOption, selectedItems: string[], result?: unknown) => void;
    MenuProps?: Record<string, unknown>;
    iconPlacement?: 'left' | 'top';
    withCheckbox?: boolean;
    selected?: MenuOption | string[];
    menuContainerClassName?: string;
    renderCustomHeader?: (props: Record<string, unknown>) => ReactNode;
    customHeaderProps?: Record<string, unknown>;
    filteredOptions?: MenuOption[];
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    onSelectAll?: (values: string[]) => void;
    onClearSelection?: () => void;
    withActionButtons?: boolean;
    onPrimaryButtonClick?: () => void;
    onTertiaryButtonClick?: () => void;
    primaryButtonProps?: Record<string, unknown>;
    tertiaryButtonProps?: Record<string, unknown>;
    tertiaryButtonLabel?: string;
    withSection?: boolean;
    className?: string;
    style?: CSSProperties;
  }

  export const Menu: FC<MenuProps>;

  /** Right-panel chat shell used on AI Copilot with custom content */
  export interface ChatBotComponentProps {
    userName?: string;
    isChatBotOpen?: boolean;
    setIsChatBotOpen?: (open: boolean) => void;
    onClose?: () => void;
    isCustomScreen?: boolean;
    showSuggestionBanner?: boolean;
    showHistoryPanel?: boolean;
    footerText?: string;
    isStopIcon?: boolean;
    onSendIconClick?: () => void;
    isAssistantThinking?: boolean;
    handleNewChatClick?: () => { isInitialClickPresent: boolean };
    customScreenJsx?: ReactNode;
    customInputComponent?: ReactNode;
    [key: string]: unknown;
  }
  export const ChatBotComponent: FC<ChatBotComponentProps>;

  // ── Loader ───────────────────────────────────────────────────────────────
  export interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
  }
  export const Loader: FC<LoaderProps>;

  // ── Alert ────────────────────────────────────────────────────────────────
  export interface AlertProps {
    title?: ReactNode;
    description?: ReactNode;
    severity?: 'success' | 'info' | 'warning' | 'error';
    onClose?: () => void;
    onAction?: () => void;
    actionName?: string;
    subtleBackground?: boolean;
    actionButtonProps?: Record<string, unknown>;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }
  export const Alert: FC<AlertProps>;

  // ── Panel ────────────────────────────────────────────────────────────────
  export interface PanelProps {
    open?: boolean;
    setIsOpen?: (open: boolean) => void;
    anchor?: 'left' | 'right';
    size?: 'large' | 'medium';
    title?: ReactNode;
    onClose?: () => void;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    onPrimaryButtonClick?: () => void;
    onSecondaryButtonClick?: () => void;
    children?: ReactNode;
    className?: string;
    width?: string | number;
    zIndex?: number;
    customFooterContent?: ReactNode;
    primaryButtonProps?: Record<string, unknown>;
    secondaryButtonProps?: Record<string, unknown>;
  }
  export const Panel: FC<PanelProps>;

  // ── TextArea ─────────────────────────────────────────────────────────────
  export interface TextAreaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    isRequired?: boolean;
    isDisabled?: boolean;
    isError?: boolean;
    helperText?: string;
    rows?: number;
    maxLength?: number;
    width?: string;
    height?: string;
    className?: string;
    id?: string;
    name?: string;
  }
  export const TextArea: FC<TextAreaProps>;

  // ── Chart ────────────────────────────────────────────────────────────────
  export interface ChartSeriesItem {
    name?: string;
    data: number[];
    type?: string;
    color?: string;
    [key: string]: unknown;
  }
  export interface ChartProps {
    graphType?: 'column' | 'bar' | 'line' | 'area' | 'pie' | 'spline' | 'scatter' | 'bubble' | 'heatmap';
    xAxisCategories?: string[];
    xAxisTitle?: string;
    yAxisTitle?: string;
    seriesData?: ChartSeriesItem[];
    graphTitle?: string;
    stackedColumn?: boolean;
    showDownloadButton?: boolean;
    cardContainer?: boolean;
    showHeader?: boolean;
    height?: number | null;
    width?: number | null;
    showExpandButton?: boolean;
    topLeftOptions?: ReactNode;
    topRightOptions?: ReactNode;
    className?: string;
    chartOptions?: Record<string, unknown>;
    xAxisOptions?: Record<string, unknown>;
    yAxisOptions?: Record<string, unknown>;
    tooltipOptions?: Record<string, unknown>;
    legendOptions?: Record<string, unknown>;
    plotOptionsOptions?: Record<string, unknown>;
    additionalOptions?: Record<string, unknown>;
    [key: string]: unknown;
  }
  export const Chart: FC<ChartProps>;

  // ── Slider ────────────────────────────────────────────────────────────────
  export interface SliderProps {
    value?: number | [number, number];
    onChange?: (e: React.SyntheticEvent, value: number | number[]) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    header?: ReactNode;
    variant?: 'default' | 'ranged';
    inputPosition?: 'inline' | 'bottom';
    colorChangeThreshold?: number;
    valueFormat?: [string, string];
    step?: number;
    className?: string;
    [key: string]: unknown;
  }
  export const Slider: FC<SliderProps>;

  // ── ProgressBar ──────────────────────────────────────────────────────────
  export interface ProgressBarProps {
    value: number;
    showTime?: boolean;
    time?: number;
    customLabel?: ReactNode;
    status?: string;
    className?: string;
    style?: CSSProperties;
  }
  export const ProgressBar: FC<ProgressBarProps>;

  // ── Accordion ────────────────────────────────────────────────────────────
  export interface AccordionDataItem {
    header: ReactNode;
    content: ReactNode;
    value: string;
    defaultExpanded?: boolean;
    disabled?: boolean;
  }
  export interface AccordionSingleData {
    header: ReactNode;
    content: ReactNode;
    value: string;
  }
  export interface AccordionProps {
    expanded?: string | string[];
    setExpanded?: (v: string | string[]) => void;
    isMultiExpanded?: boolean;
    data?: AccordionDataItem[];
    onChange?: (value: string) => void;
    isSingleItem?: boolean;
    singleData?: AccordionSingleData;
    disabled?: boolean;
  }
  export const Accordion: FC<AccordionProps>;
  export const AccordionModern: FC<AccordionProps>;

  // ── Table ────────────────────────────────────────────────────────────────
  export interface TableColumnDef {
    field?: string;
    headerName?: string;
    isSearchable?: boolean;
    sortable?: boolean;
    filter?: boolean;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    cellRenderer?: FC<{ value: unknown; data: Record<string, unknown> }> | string;
    cellRendererParams?: Record<string, unknown>;
    valueFormatter?: (params: { value: unknown }) => string;
    pinned?: 'left' | 'right';
    checkboxSelection?: boolean;
    headerCheckboxSelection?: boolean;
    suppressMovable?: boolean;
    resizable?: boolean;
    [key: string]: unknown;
  }
  export interface TableProps {
    columnDefs: TableColumnDef[];
    rowData?: Record<string, unknown>[];
    tableHeader?: string;
    rowHeight?: number;
    height?: string | number;
    defaultPageSize?: number;
    paginationPageSizeSelector?: number[];
    onRowClicked?: (params: { data: Record<string, unknown> }) => void;
    showSearch?: boolean;
    showFilter?: boolean;
    showDownloadButton?: boolean;
    cardContainer?: boolean;
    hideTableSetting?: boolean;
    topRightOptions?: ReactNode;
    topLeftOptions?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }
  export const Table: FC<TableProps>;

  export const HomePage: FC<{
    clientName?: string;
    userName?: string;
    toolKitItems?: Array<{
      name: string;
      description?: string;
      details?: string;
      cta?: string;
      folderContent?: string[];
    }>;
    smartAiItems?: Array<{
      name: string;
      description?: string;
      details?: string;
      cta?: string;
      isNewProduct?: boolean;
      folderContent?: string[];
    }>;
    configurationsMenuItems?: Array<{ logo: string; label: string; desc: string }>;
    activeToolKitItem?: object | null;
    activeSmartAiItem?: object | null;
    onLaunchClick?: (item?: object | null) => void;
    onBookDemoClick?: (item?: object) => void;
    onViewReleasedNotesClick?: () => void;
    onConfigurationsClick?: (item?: object) => void;
    onKnowMoreClick?: (item?: object | null) => void;
    showConfigurationsButton?: boolean;
  }>;
}
