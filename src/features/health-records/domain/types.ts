export type SymptomCheckListItem = {
  id: string;
  date: string | null;
  topSymptoms: string[];
  triageLevel: string | null;
};

export type SymptomCheckDetail = SymptomCheckListItem & {
  answers: Record<string, unknown> | null;
  redFlags: string[];
  guidance: string | null;
  aiSummary: string | null;
};

export type DoctorRecordListItem = {
  id: string;
  date: string | null;
  doctorName: string | null;
  visitType: string | null;
};

export type DoctorRecordDetail = DoctorRecordListItem & {
  diagnosisNote: string | null;
  plan: string | null;
  prescriptions: string[];
  attachments: string[];
};

export type AppointmentListItem = {
  id: string;
  dateTime: string | null;
  status: string | null;
  joinUrl: string | null;
};

export type AppointmentDetail = AppointmentListItem & {
  notes: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export type OverviewResponse = {
  symptomChecks: {
    count: number;
    latest: SymptomCheckListItem | null;
  };
  doctorRecords: {
    count: number;
    latest: DoctorRecordListItem | null;
  };
  appointments: {
    count: number;
    latest: AppointmentListItem | null;
  };
};
