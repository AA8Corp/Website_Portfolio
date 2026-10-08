export type SpaceId = "office" | "clinic" | "retail";

export type Cadence = { title: string; tasks: string[] };

export type Space = {
  id: SpaceId;
  name: string;
  short: string;
  blurb: string;
  rateFactor: number;
  cadence: Cadence[];
  sampleReport: { site: string; items: string[] };
};

export const SPACES: Space[] = [
  {
    id: "office",
    name: "Offices",
    short: "Office",
    blurb: "Desks, kitchens, conference rooms, and the restroom everyone judges you by.",
    rateFactor: 1,
    cadence: [
      { title: "Every visit", tasks: ["Desks wiped, clutter left where it is", "Kitchens, sinks, and appliance fronts", "Restrooms cleaned and restocked", "Vacuum high-traffic carpet", "Trash, recycling, compost"] },
      { title: "Weekly", tasks: ["Full vacuum, edges and under desks", "Glass, partitions, and conference screens", "Phones and keyboards sanitized", "Baseboards and vents dusted"] },
      { title: "Monthly", tasks: ["Hard-floor scrub and burnish", "Upholstery spot treatment", "Supervisor walk-through with your office manager"] },
    ],
    sampleReport: { site: "Northgate Partners, Floor 12", items: ["Open office, 64 desks", "Kitchen and café bar", "Conference rooms A–F", "Restrooms, 4", "Reception glass"] },
  },
  {
    id: "clinic",
    name: "Medical clinics",
    short: "Clinic",
    blurb: "Exam rooms disinfected to protocol, logged touchpoints, and a binder ready for your inspector.",
    rateFactor: 1.35,
    cadence: [
      { title: "Every visit", tasks: ["Exam rooms disinfected with EPA List N products", "Touchpoint log: handles, rails, switches, chairs", "Color-coded microfiber, no cross-room use", "Waiting room floors and seating", "Sharps and biohazard bins checked, never handled"] },
      { title: "Weekly", tasks: ["Lab and break-room deep clean", "High dusting above 6 ft", "Privacy curtains spot-cleaned"] },
      { title: "Monthly", tasks: ["Floor strip-and-seal schedule", "Compliance binder updated for your inspector", "Product SDS sheets refreshed"] },
    ],
    sampleReport: { site: "Harbor Medical Group, Suite 400", items: ["Exam rooms 1–6", "Waiting room", "Lab and sample drop", "Restrooms, 3", "Staff break room"] },
  },
  {
    id: "retail",
    name: "Retail",
    short: "Retail",
    blurb: "A sales floor that looks like opening day, every morning, before the doors unlock.",
    rateFactor: 1.15,
    cadence: [
      { title: "Every visit", tasks: ["Sales floor dust-mop and spot mop", "Entry glass and door push-plates", "Fitting rooms reset and mirrors polished", "Restrooms cleaned and restocked", "Counters and POS stations sanitized"] },
      { title: "Weekly", tasks: ["Fixture and shelf-edge dusting", "Stockroom sweep", "Exterior entry sweep and gum removal"] },
      { title: "Monthly", tasks: ["Machine scrub on hard floors", "Window tracks and display platforms", "Walk-through with your store manager before seasonal resets"] },
    ],
    sampleReport: { site: "Fieldstone Outfitters, Main St", items: ["Sales floor, 4,800 sq ft", "Fitting rooms, 8", "Entry and windows", "Stockroom", "Customer restroom"] },
  },
];

export const spaceById = (id: string | undefined): Space | undefined => SPACES.find((s) => s.id === id);

/** Rooms on the 3D demo floor plan (Harbor Medical, Suite 400). Units are meters-ish; x spans -6..6, z spans -4..4. */
export type Room = { id: string; name: string; x: number; z: number; w: number; d: number };

export const ROOMS: Room[] = [
  { id: "reception", name: "Reception", x: -4.5, z: -2.5, w: 3, d: 3 },
  { id: "exam1", name: "Exam room 1", x: -1.5, z: -2.5, w: 3, d: 3 },
  { id: "exam2", name: "Exam room 2", x: 1.5, z: -2.5, w: 3, d: 3 },
  { id: "exam3", name: "Exam room 3", x: 4.5, z: -2.5, w: 3, d: 3 },
  { id: "lab", name: "Lab", x: 4.5, z: 2, w: 3, d: 4 },
  { id: "break", name: "Break room", x: 1.5, z: 2, w: 3, d: 4 },
  { id: "restrooms", name: "Restrooms", x: -1.5, z: 2, w: 3, d: 4 },
  { id: "waiting", name: "Waiting room", x: -4.5, z: 1.5, w: 3, d: 5 },
];

/** Times shown beside each room in the hero checklist, as if logged by the crew tablet. */
export const ROOM_TIMES = ["4:12", "4:21", "4:33", "4:44", "4:58", "5:09", "5:18", "5:31"];
