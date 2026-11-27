// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  Alert,
  AlertDialog,
  AppBarRow,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  Checkbox,
  CheckboxGroup,
  Chip,
  CircularProgressIndicator,
  ColorPicker,
  ColorPickerField,
  ColorSwatch,
  Combobox,
  CommandPalette,
  ContextMenu,
  CopyButton,
  DataTable,
  DatePicker,
  DatePickerField,
  Dialog,
  Divider,
  DragHandle,
  DropdownMenu,
  Empty,
  FAB,
  FABMenu,
  Fieldset,
  FileUpload,
  FileUploadDropzone,
  FloatingToolbar,
  Form,
  IconButton,
  Kbd,
  LinearProgressIndicator,
  List,
  ListItem,
  LoadingIndicator,
  M3EProvider,
  MaterialShapeView,
  Meter,
  NavigationBar,
  NavigationRail,
  NumberField,
  OTPField,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  ScrollArea,
  SearchBar,
  SearchView,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Snippet,
  SplitButton,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TextField,
  TimePicker,
  TimePickerField,
  Tooltip,
  TopAppBar,
} from "../index.js";

const NOOP = () => {};

describe("m3eui SSR rendering in Node", () => {
  it("renders M3EProvider and all exported components without browser globals or warnings", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const errorSpy = vi.spyOn(console, "error").mockImplementation(NOOP);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(NOOP);
    let html = "";

    try {
      html = renderToString(
        <M3EProvider syncDocumentRoot={false} locale="en-US">
          <main>
            <TopAppBar title="App" actions={<AppBarRow items={[{ id: "a", label: "Add", icon: "+" }]} />} />
            <Accordion items={[{ value: "1", title: "One", content: "Content" }]} />
            <Alert title="Heads up">Alert body</Alert>
            <AvatarGroup>
              <Avatar alt="Alice" fallback="A" />
            </AvatarGroup>
            <Badge count={4}>
              <span>Mail</span>
            </Badge>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Docs" }]} />
            <Button>Save</Button>
            <ButtonGroup items={[{ value: "a", label: "A" }]} />
            <Card>Card body</Card>
            <Carousel items={[{ id: "s1", title: "Slide", content: <div>Slide</div> }]} />
            <CheckboxGroup aria-label="Options">
              <Checkbox label="Check" />
            </CheckboxGroup>
            <Chip>Tag</Chip>
            <ColorSwatch colors={["#6750A4"]} />
            <ColorPicker defaultValue="#6750A4" />
            <ColorPickerField label="Accent" defaultValue="#6750A4" />
            <Combobox options={[{ value: "one", label: "One" }]} label="Fruit" />
            <CommandPalette items={[{ id: "c1", label: "Open", onSelect: NOOP }]} />
            <DataTable
              caption="Items"
              columns={[
                {
                  id: "name",
                  header: "Name",
                  cell: (r: { id: string; name: string }) => r.name,
                },
              ]}
              rows={[{ id: "1", name: "Alpha" }]}
              getRowKey={(r) => r.id}
            />
            <DatePicker defaultValue="2026-11-27" />
            <DatePickerField label="Date" defaultValue="2026-11-27" />
            <Dialog trigger={<button type="button">Dialog</button>} title="Confirm">
              Body
            </Dialog>
            <AlertDialog trigger={<button type="button">Alert</button>} title="Delete?">
              Sure?
            </AlertDialog>
            <Divider label="OR" />
            <DragHandle aria-label="Reorder" />
            <Empty title="Empty" />
            <FAB aria-label="Create" icon="+" />
            <FABMenu
              icon="+"
              aria-label="Actions"
              items={[{ id: "m1", label: "New", icon: "+" }]}
            />
            <FileUploadDropzone onFilesAccepted={NOOP} />
            <FileUpload />
            <FloatingToolbar items={[{ id: "f1", label: "Edit", icon: "E" }]} />
            <Form>
              <Fieldset legend="Profile">
                <TextField label="Name" />
              </Fieldset>
            </Form>
            <IconButton aria-label="Close" icon="×" />
            <Kbd keys={["Mod", "K"]} />
            <List>
              <ListItem headline="Item" />
            </List>
            <LoadingIndicator />
            <MaterialShapeView shape="sunny" />
            <DropdownMenu trigger={<button type="button">Menu</button>} items={[{ id: "i1", label: "One" }]} />
            <ContextMenu items={[{ id: "c1", label: "Copy" }]}>
              <span>Right click</span>
            </ContextMenu>
            <Meter label="Storage" value={40} />
            <NavigationBar
              items={[{ value: "home", label: "Home", icon: "H" }]}
              value="home"
              onValueChange={NOOP}
            />
            <NavigationRail
              modal="auto"
              collapsible
              items={[{ value: "home", label: "Home", icon: "H" }]}
              value="home"
              onValueChange={NOOP}
            />
            <NumberField label="Count" defaultValue={1} />
            <OTPField label="Code" />
            <Pagination totalPages={5} defaultPage={1} />
            <Popover trigger={<button type="button">Info</button>} title="Info">
              Details
            </Popover>
            <LinearProgressIndicator value={50} />
            <CircularProgressIndicator value={50} />
            <RadioGroup defaultValue="a" aria-label="Choice">
              <Radio value="a" label="A" />
            </RadioGroup>
            <ScrollArea>Scrollable</ScrollArea>
            <SearchBar placeholder="Search" />
            <SearchView placeholder="Search view" />
            <Select options={[{ value: "a", label: "Alpha" }]} label="Select" />
            <Sheet trigger={<button type="button">Sheet</button>} title="Panel">
              Sheet body
            </Sheet>
            <Skeleton />
            <Slider defaultValue={30} aria-label="Volume" />
            <CopyButton value="npm i m3eui" />
            <Snippet code="npm i m3eui" />
            <SplitButton menuItems={[{ id: "s1", label: "Draft" }]}>Publish</SplitButton>
            <Switch aria-label="Toggle" />
            <Tabs defaultValue="one">
              <TabsList>
                <Tab value="one">One</Tab>
              </TabsList>
              <TabsPanel value="one">Panel one</TabsPanel>
            </Tabs>
            <TimePicker defaultValue="09:30" />
            <TimePickerField label="Time" defaultValue="09:30" />
            <Tooltip content="Tip">
              <button type="button">Hover</button>
            </Tooltip>
          </main>
        </M3EProvider>,
      );

      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    }

    expect(html.length).toBeGreaterThan(500);
    expect(html).toContain("m3e-button");
    expect(html).toContain("m3e-nav-rail");
    expect(html).toContain("m3e-divider--labeled");
    expect(html).toContain("Publish");
  });
});
