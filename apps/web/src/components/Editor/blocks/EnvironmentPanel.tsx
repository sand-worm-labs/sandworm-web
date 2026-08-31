import { Transition } from "@headlessui/react";
import { PiCpuLight } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";
import ScrollBar from "@/components/Editor/blocks/ScrollBar";

const requirements = `jupyter_server==2.12.1
  ipykernel==6.27.1
  matplotlib==3.8.2
  numpy==1.26.2
  pandas==1.5.3
  psycopg2==2.9.9
  plotly==5.18.0
  scipy==1.11.4
  transformers==4.36.0
  ipywidgets==7.8.1
  seaborn==0.13.0
  altair==5.2.0
  altair-viewer
  altair-transform==0.2.0
  boto3==1.35.5
  vegafusion==1.5.0
  vegafusion-python-embed==1.5.0
  vl-convert-python==1.2.0
  tiktoken==0.5.2
  polars==0.19.19
  SQLAlchemy==1.4.50
  google-api-core==2.15.0
  google-api-python-client==1.6.7
  google-api-support==0.1.4
  google-auth==2.25.2
  google-auth-httplib2==0.2.0
  google-auth-oauthlib==1.2.0
  google-cloud-aiplatform==1.38.0
  google-cloud-appengine-logging==1.4.0
  google-cloud-audit-log==0.2.5
  google-cloud-bigquery==3.14.0
  google-cloud-bigquery-connection==1.14.0
  google-cloud-bigquery-storage==2.24.0
  google-cloud-billing==1.12.0
  google-cloud-core==2.4.1
  google-cloud-functions==1.14.0
  google-cloud-iam==2.13.0
  google-cloud-logging==3.9.0
  google-cloud-resource-manager==1.11.0
  google-cloud-storage==2.14.0
  google-crc32c==1.5.0
  google-pasta==0.2.0
  google-resumable-media==2.7.0
  googleapis-common-protos==1.62.0
  db-dtypes==1.2.0
  fastparquet==2024.2.0
  oracledb==2.2.0
  redshift-connector==2.0.917
  sqlalchemy-redshift==0.8.14
  trino==0.329.0
  duckdb==1.0.0
  openpyxl==3.1.2
  mysqlclient==2.2.4
  pymongo==4.8.0
  snowflake-connector-python==3.12.2
  snowflake-sqlalchemy==1.6.1`;

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-sm font-medium text-ink-400">{label}</dt>
      <dd className="text-sm text-ink-100 dark:text-white">{value}</dd>
    </div>
  );
}

interface Props {
  visible: boolean;
  onHide: () => void;
}

export default function EnvironmentPanel(props: Props) {
  return (
    <Transition
      as="div"
      show={props.visible}
      className="h-full overflow-hidden flex-shrink-0 font-body"
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className="w-[324px] flex flex-col border-l dark:border-border-tertiary border-border-secondary h-full bg-white font-body dark:bg-page-surface">
        <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                <PiCpuLight size={18} className="flex-shrink-0" />
                Python 3.9
              </h3>
              <p className="text-[12.5px] text-ink-400 mt-0.5">
                The environment for your documents.
              </p>
            </div>
            <CloseIconButton
              size="sm"
              round
              onClick={props.onHide}
              aria-label="Close environment"
            />
          </div>
        </div>

        <ScrollBar className="flex-1 min-h-0 px-4 xl:px-6 py-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-1">
            Compute
          </h4>
          <div className="divide-y divide-border-secondary dark:divide-border-tertiary mb-6">
            <DetailRow label="Memory" value="Local machine" />
            <DetailRow label="CPU" value="Local machine" />
            <DetailRow label="GPU" value="Local machine" />
            <DetailRow label="Network" value="Up to 5 Gigabit" />
          </div>

          <h4 className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-1">
            Python
          </h4>
          <div className="divide-y divide-border-secondary dark:divide-border-tertiary mb-4">
            <DetailRow label="Version" value="3.9" />
            <DetailRow label="Pip version" value="23.0.1" />
          </div>

          <div className="flex items-center gap-x-2 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Libraries
            </span>
            <span className="font-mono text-[10px] text-ink-400">
              (requirements.txt)
            </span>
          </div>
          <pre className="bg-base-300 dark:bg-base-700 rounded-lg max-h-96 p-3 text-[11px] overflow-y-auto overflow-x-auto border border-border-secondary dark:border-border-tertiary text-ink-100 dark:text-ink-200">
            {requirements}
          </pre>
        </ScrollBar>
      </div>
    </Transition>
  );
}
