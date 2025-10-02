import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function OpenAccessPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        International Journal of Social Work and Development Studies (IJSDS)
      </h1>

      {/* Open Access Notice */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Open Access Notice</h2>
          <p>
            The International Journal of Social Work and Development Studies is an{" "}
            <strong>open-access journal</strong>, which means that all articles are
            freely available online to anyone, anywhere. We use a{" "}
            <strong>Creative Commons Attribution 4.0 International License (CC BY 4.0)</strong>, 
            which allows authors to retain copyright while granting users the right 
            to read, download, copy, distribute, print, search, or link to the full 
            texts of articles.
          </p>
        </CardContent>
      </Card>

      {/* Aims and Scope */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Aims and Scope</h2>
          <p>
            The International Journal of Social Work and Development Studies aims to promote
            social work and development studies globally. Our scope includes but is not 
            limited to <em>social work practice, social policy, community development, 
            and human rights</em>. We welcome submissions from scholars and practitioners worldwide.
          </p>
        </CardContent>
      </Card>

      {/* Licensing Terms */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Licensing Terms</h2>
          <p>
            Articles published in this journal are licensed under a{" "}
            <strong>Creative Commons Attribution 4.0 International License (CC BY 4.0)</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Copyright Terms</h2>
          <p>
            Authors retain copyright of their work, granting the journal{" "}
            <strong>right of first publication</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Author Charges */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Author Charges</h2>
          <p>
            We do not charge submission fees or page charges. However, we do charge an{" "}
            <strong>article processing charge (APC) of ₦20,000</strong> and{" "}
            <strong>₦5,000 vetting fees</strong> to cover publication costs.
          </p>
          <p>
            <strong>Fee waivers</strong> are available for authors from low-income countries
            or those facing financial hardship. Please contact us for more information.
          </p>
        </CardContent>
      </Card>

      {/* Publisher Info */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-semibold">Publisher Information</h2>
          <p>
            <strong>Publisher:</strong> International Journal of Social Work and Development Studies (IJSDS)
          </p>
          <p>
            <strong>Address:</strong> Department of Social Work, Faculty of Social Sciences, 
            Rivers State University, Emohua, Rivers State
          </p>
          <p>
            <strong>Contact Person:</strong> Mina Ogbanga, PhD
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:editor.ijsds@gmail.com" className="text-blue-600 underline">
              editor.ijsds@gmail.com
            </a>
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href="http://www.ijsds.org" target="_blank" className="text-blue-600 underline">
              www.ijsds.org
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
