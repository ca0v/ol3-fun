// from http://sampleserver6.arcgisonline.com/arcgis/rest/services/Military/FeatureServer/8?f=pjson

const featureServer = <any>{
  currentVersion: 10.3,
  id: 8,
  name: "Lansing River",
  type: "Feature Layer",
  description: "",
  copyrightText: "",
  defaultVisibility: true,
  editFieldsInfo: null,
  ownershipBasedAccessControlForFeatures:
    null,
  syncCanReturnChanges: false,
  relationships: [],
  isDataVersioned: false,
  supportsRollbackOnFailureParameter:
    true,
  supportsStatistics: true,
  supportsAdvancedQueries: true,
  advancedQueryCapabilities: {
    supportsPagination: true,
    supportsStatistics: true,
    supportsOrderBy: true,
    supportsDistinct: true,
  },
  geometryType: "esriGeometryPolyline",
  minScale: 0,
  maxScale: 0,
  extent: {
    xmin: -344.426566832,
    ymin: -85.921450151,
    xmax: 6994102.02410803,
    ymax: 5840137.74983172,
    spatialReference: {
      wkid: 4326,
      latestWkid: 4326,
    },
  },
  drawingInfo: {
    renderer: {
      type: "simple",
      symbol: {
        type: "esriSLS",
        style: "esriSLSSolid",
        color: [0, 58, 166, 255],
        width: 5,
      },
      label: "",
      description: "",
    },
    transparency: 0,
    labelingInfo: null,
  },
  hasM: false,
  hasZ: false,
  allowGeometryUpdates: true,
  hasAttachments: false,
  htmlPopupType:
    "esriServerHTMLPopupTypeAsHTMLText",
  objectIdField: "objectid",
  globalIdField: "",
  displayField: "st_length(shape)",
  typeIdField: "",
  fields: [
    {
      name: "objectid",
      type: "esriFieldTypeOID",
      alias: "OBJECTID",
      domain: null,
      editable: false,
      nullable: false,
    },
  ],
  types: [],
  templates: [
    {
      name: "Lansing River",
      description: "River",
      prototype: {
        attributes: {},
      },
      drawingTool:
        "esriFeatureEditToolLine",
    },
  ],
  maxRecordCount: 1000,
  supportedQueryFormats: "JSON, AMF",
  capabilities:
    "Create,Delete,Query,Update,Uploads,Editing",
  useStandardizedQueries: true,
};

export default featureServer;
