import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Database, Lock, Globe, CheckCircle2, Shield } from "lucide-react";

export const PreservationPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Preservation & Archiving Policy</h1>
          <p className="text-lg text-muted-foreground">
            IJSDS is committed to ensuring long-term preservation and accessibility of all published scholarly content through robust digital preservation strategies and archiving protocols.
          </p>
        </div>

        {/* Digital Preservation Commitment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              <CardTitle>Digital Preservation Commitment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The International Journal of Social Work and Development Studies ensures that all published research articles are preserved for perpetual access and maintained in accordance with international digital preservation standards.
            </p>
            <p className="text-muted-foreground">
              Our preservation strategy guarantees that scholarly content remains accessible to the academic community and general public indefinitely, even in the event of technological changes or journal discontinuation.
            </p>
          </CardContent>
        </Card>

        {/* Internet Archive - Google Drive */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Internet Archive - Google Drive</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              IJSDS is committed to long-term preservation through internet archiving using Google Drive, providing secure and permanent access to all published scholarly content.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Where to Find Preservation Information</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  All preservation and archiving information for the International Journal of Social Work and Development Studies can be accessed through our Google Drive archive:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Archive Link (Google Drive):</p>
                  <a 
                    href="https://drive.google.com/drive/folders/18XbeNwgTpRgk72CLx2eTpTArpg5qAbxd?usp=sharing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    Internet Archive for Journals
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Archival Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Published articles are archived using Google Drive as our internet archiving solution to ensure permanent public access. Google Drive provides enterprise-grade security, redundancy, and global accessibility, with automatic backups and version control for all archived content.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Access & Retrieval</h4>
                <p className="text-sm text-muted-foreground">
                  Archived content remains freely accessible to the public indefinitely through our Google Drive repository, even in the event of journal discontinuation or platform changes. All published articles are preserved in multiple formats with full metadata for easy discovery and citation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preservation Partners */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Preservation Standards & Partners</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              IJSDS adheres to internationally recognized preservation standards and best practices:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Open Archival Information System (OAIS):</strong> We follow the ISO 14721:2012 OAIS reference model for digital preservation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Metadata Standards:</strong> Full bibliographic metadata maintained in Dublin Core and JATS XML formats</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Checksum Verification:</strong> Regular integrity checks using MD5 and SHA-256 algorithms to detect data corruption</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Backup Protocols:</strong> Daily incremental backups and monthly full backups with off-site storage</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* DOI and Persistent Identifiers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Persistent Identifiers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Digital Object Identifiers (DOI)</h4>
                <p className="text-sm text-muted-foreground">
                  Every published article receives a unique Digital Object Identifier (DOI) that provides a permanent link to the content, ensuring citability and accessibility regardless of changes to web addresses or hosting platforms.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">DOI Resolution</h4>
                <p className="text-sm text-muted-foreground">
                  DOIs are maintained and updated to always point to the current location of the content. Even if our website or hosting infrastructure changes, the DOI will continue to resolve to the correct article.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">ORCID Integration</h4>
                <p className="text-sm text-muted-foreground">
                  We support and encourage the use of ORCID identifiers for authors, ensuring permanent linkage between researchers and their published work.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Guarantee */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Long-Term Access Guarantee</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              IJSDS guarantees perpetual open access to all published content:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• All published articles remain freely accessible online without subscription or registration requirements</li>
              <li>• Content is preserved in multiple formats (PDF, HTML, XML) to ensure long-term readability</li>
              <li>• Full-text and metadata are available for harvesting via OAI-PMH protocol</li>
              <li>• In the event of journal cessation, content will be transferred to trusted digital archives</li>
              <li>• Authors retain rights to deposit their work in institutional or subject repositories</li>
            </ul>
          </CardContent>
        </Card>

        {/* Metadata Harvesting */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata Harvesting & Interoperability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To maximize discoverability and ensure long-term accessibility, IJSDS provides comprehensive metadata through:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>OAI-PMH Protocol:</strong> Open Archives Initiative Protocol for Metadata Harvesting enables automated harvesting by aggregators and indexing services</li>
              <li>• <strong>CrossRef Metadata Deposit:</strong> Full metadata deposited with CrossRef for DOI registration and citation tracking</li>
              <li>• <strong>DOAJ Compliance:</strong> Metadata structured according to Directory of Open Access Journals standards</li>
              <li>• <strong>Search Engine Optimization:</strong> Metadata optimized for discovery through academic search engines like Google Scholar</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contingency Planning */}
        <Card>
          <CardHeader>
            <CardTitle>Contingency & Succession Planning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              IJSDS has established comprehensive contingency measures:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong>Succession Plan:</strong> Documented procedures for editorial and technical succession</li>
              <li>• <strong>Financial Sustainability:</strong> Reserve funds allocated for ongoing preservation costs</li>
              <li>• <strong>Archive Transfer Agreements:</strong> Pre-arranged agreements with institutional repositories for content transfer if needed</li>
              <li>• <strong>Disaster Recovery:</strong> Comprehensive disaster recovery protocols including off-site backups and rapid restoration procedures</li>
              <li>• <strong>Technical Documentation:</strong> Complete technical documentation maintained for all systems and processes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Version Control */}
        <Card>
          <CardHeader>
            <CardTitle>Version Control & Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              When articles are updated or corrected:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• All versions of articles are preserved and accessible</li>
              <li>• Version history is clearly documented with timestamps and change descriptions</li>
              <li>• Original versions remain available even after corrections or updates</li>
              <li>• DOIs link to the most current version while providing access to previous versions</li>
              <li>• Errata and corrigenda are clearly marked and linked to original publications</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Questions About Preservation?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For questions about our preservation and archiving policies, or to request archived content, please contact:
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <p><strong>Email:</strong> editor.ijsds@gmail.com</p>
              <p><strong>Subject:</strong> Digital Preservation Inquiry</p>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-sm text-muted-foreground text-center pt-4">
          <p>Last Updated: January 2025</p>
        </div>
      </div>
    </div>
  );
};