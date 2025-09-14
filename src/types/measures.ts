export interface BandData {
  id: string;
  range: [number, number];
  rangeLabel: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  color: string;
}

export interface MeasureData {
  displayName: string;
  altName: string;
  shortDescription: string;
  fullDescription: string;
  userLabel: string;
  scaleLabels: {
    left: string;
    right: string;
  };
  bands: BandData[];
}

export interface TreeSubtype {
  id: string;
  name: string;
  displayName: string | string[];
  range: [number, number];
  altRange?: [number, number];
  description: string;
  userDescription?: string;
  position: string;
}

export interface TreeData {
  displayName: string;
  altName: string;
  shortDescription: string;
  fullDescription: string;
  userLabel: string;
  scale: {
    min: number;
    max: number;
    circular: boolean;
  };
  subtypes: TreeSubtype[];
}

export interface MeasuresComplete {
  measures: {
    bucket: MeasureData;
    thickness: MeasureData;
    input: MeasureData;
    output: MeasureData;
    tree: TreeData;
    engagement?: any;
    interaction?: any;
  };
}