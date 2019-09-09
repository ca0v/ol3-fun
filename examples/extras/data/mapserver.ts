// from http://sampleserver6.arcgisonline.com/arcgis/rest/services/Military/MapServer/8?f=pjson

const mapserver = <any>{
	currentVersion: 10.3,
	id: 8,
	name: "Lansing River",
	type: "Feature Layer",
	description: "",
	geometryType: "esriGeometryPolyline",
	copyrightText: "",
	parentLayer: {
		id: 7,
		name: "AO_Lion"
	},
	subLayers: [],
	minScale: 0,
	maxScale: 0,
	drawingInfo: {
		renderer: {
			type: "simple",
			symbol: {
				type: "esriSLS",
				style: "esriSLSSolid",
				color: [0, 58, 166, 255],
				width: 5
			},
			label: "",
			description: ""
		},
		transparency: 0,
		labelingInfo: null
	},
	defaultVisibility: true,
	extent: {
		xmin: -344.426566832,
		ymin: -85.921450151,
		xmax: 6994102.02410803,
		ymax: 5840137.74983172,
		spatialReference: {
			wkid: 4326,
			latestWkid: 4326
		}
	},
	hasAttachments: false,
	htmlPopupType: "esriServerHTMLPopupTypeAsHTMLText",
	displayField: "st_length(shape)",
	typeIdField: null,
	fields: [
		{
			name: "objectid",
			type: "esriFieldTypeOID",
			alias: "OBJECTID",
			domain: null
		},
		{
			name: "shape",
			type: "esriFieldTypeGeometry",
			alias: "SHAPE",
			domain: null
		},
		{
			name: "st_length(shape)",
			type: "esriFieldTypeDouble",
			alias: "st_length(shape)",
			domain: null
		}
	],
	relationships: [],
	canModifyLayer: false,
	canScaleSymbols: false,
	hasLabels: false,
	capabilities: "Map,Query,Data",
	maxRecordCount: 1000,
	supportsStatistics: true,
	supportsAdvancedQueries: true,
	supportedQueryFormats: "JSON, AMF",
	ownershipBasedAccessControlForFeatures: { allowOthersToQuery: true },
	useStandardizedQueries: true,
	advancedQueryCapabilities: {
		useStandardizedQueries: true,
		supportsStatistics: true,
		supportsOrderBy: true,
		supportsDistinct: true,
		supportsPagination: true,
		supportsTrueCurve: true
	}
};

export = mapserver;
