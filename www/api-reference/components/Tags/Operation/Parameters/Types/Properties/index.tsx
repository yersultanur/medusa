import Loading from "@/app/loading"
import { SchemaObject } from "@/types/openapi"
import dynamic from "next/dynamic"
import clsx from "clsx"
import type { TagOperationParametersProps } from "../.."

const TagOperationParameters = dynamic<TagOperationParametersProps>(
  async () => import("../.."),
  {
    loading: () => <Loading />,
  }
) as React.FC<TagOperationParametersProps>

export type TagOperationParametersPropertiesProps = {
  schema: SchemaObject
  className?: string
}

const TagOperationParametersProperties = ({
  schema,
  className,
}: TagOperationParametersPropertiesProps) => {
  // console.log(schema)
  return (
    <div className={clsx(className)}>
      {Object.entries(schema.properties).map(([key, value]) => {
        return (
          <div key={key}>
            <TagOperationParameters
              schemaObject={{
                ...value,
                title: key,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default TagOperationParametersProperties