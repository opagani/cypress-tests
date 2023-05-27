export interface Listing {
  listingId: string;
  listingAlias: string;
  alias: number;
  aliasEncoded: string;
  name: string;
  street: string;
  city: string;
  unit: string;
  state: string;
  zip: string;
  country: string;
  lotId: number;
  geo: {
    lat: number;
    lon: number;
  };
  active: boolean;
  dateCreated: string;
  dateCreatedTimestamp: number;
  listingTypeCode: number;
  propertyTypeCode: number;
  isCommunity: boolean;
  isMultifamily: boolean;
  unitId: number;
  contactEmail: string;
  contactPhone: string;
  permanent: boolean;
  dateUpdated: string;
  dateUpdatedTimestamp: number;
  isPartialResponse: boolean;
  feedId: string;
  feedListingId: string;
}
