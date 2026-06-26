export type LinkStatus = 'safe' | 'danger' | 'warning' | 'unknown';

export interface CheckedLink {
  id: string;
  url: string;
  status: LinkStatus;
  riskScore: number;
  category: string;
  domainAge: string;
  sslCert: string;
  country: string;
  registrar: string;
  source: string;
  timestamp: string;
  riskFactors: string[];
}
