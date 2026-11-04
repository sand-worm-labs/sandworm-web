// The setup's fields, asked for by the load and returned by the save.
export const SETUP_FIELDS = `
  organisation { type name website }
  tracking { addresses autoDiscover competitors regions shareInternalData }
  goals { selected }
  team { invites { id email access } }
`;
