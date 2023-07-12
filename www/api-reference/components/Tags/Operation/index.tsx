"use client"

import { Operation } from "@/types/openapi"
import clsx from "clsx"
import { OpenAPIV3 } from "openapi-types"
import getSectionId from "@/utils/get-section-id"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import Loading from "@/app/loading"
import type { TagOperationParametersProps } from "./Parameters"
import { useInView } from "react-intersection-observer"
import { useSidebar } from "@/providers/sidebar"
import { useBaseSpecs } from "@/providers/base-specs"
import SecurityDescription from "@/components/MDXComponents/Security/Description"

const TagOperationParameters = dynamic<TagOperationParametersProps>(
  async () => import("./Parameters"),
  {
    loading: () => <Loading />,
  }
) as React.FC<TagOperationParametersProps>

export type TagOperationProps = {
  operation: Operation
  method?: string
  tag: OpenAPIV3.TagObject
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TagOperation = ({ operation, method }: TagOperationProps) => {
  const { setActivePath } = useSidebar()
  const { getSecuritySchema } = useBaseSpecs()
  const path = getSectionId([operation.operationId])
  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView) {
        // can't use next router as it doesn't support
        // changing url without scrolling
        history.pushState({}, "", `#${path}`)
        setActivePath(path)
      }
    },
  })

  return (
    <Suspense fallback={<Loading />}>
      <div className={clsx("flex min-h-screen")} id={path} ref={ref}>
        <div className={clsx("w-api-ref-content")}>
          <h3>{operation.summary}</h3>
          <p>{operation.description}</p>
          {operation.security && (
            <details className="my-1">
              <summary>
                <div className="inline-flex w-11/12">
                  <span className="w-1/3">
                    <b>Authorizations</b>
                  </span>
                  <span className="w-2/3">
                    {operation.security?.map((security, index) => (
                      <div key={index}>
                        {index !== 0 && " or "}
                        {
                          getSecuritySchema(Object.keys(security)[0])?.[
                            "x-displayName"
                          ]
                        }
                      </div>
                    ))}
                  </span>
                </div>
              </summary>

              <div className="bg-medusa-bg-subtle dark:bg-medusa-bg-subtle-dark p-1">
                {operation.security?.map((security, index) => {
                  const securitySchema = getSecuritySchema(
                    Object.keys(security)[0]
                  )
                  if (!securitySchema) {
                    return <></>
                  }
                  return (
                    <SecurityDescription
                      securitySchema={securitySchema}
                      isServer={false}
                      key={index}
                    />
                  )
                })}
              </div>
            </details>
          )}
          {operation.requestBody && (
            <>
              <div
                className={clsx(
                  "border-medusa-border-base dark:border-medusa-border-base-dark border-b border-solid",
                  "mb-1"
                )}
              >
                <span className={clsx("uppercase")}>Request Body Schema:</span>{" "}
                {Object.keys(operation.requestBody.content)[0]}
              </div>
              <TagOperationParameters
                schemaObject={
                  operation.requestBody.content[
                    Object.keys(operation.requestBody.content)[0]
                  ].schema
                }
              />
            </>
          )}
          <h4>Responses</h4>
          {Object.entries(operation.responses).map(([code, response]) => (
            <div key={code}>
              {response.content && (
                <details open={code === "200"}>
                  <summary
                    className={clsx(
                      "mb-1 rounded-sm py-0.5 px-1",
                      code.match(/20[0-9]/) &&
                        "bg-medusa-tag-green-bg dark:bg-medusa-tag-green-bg-dark text-medusa-tag-green-text dark:text-medusa-tag-green-text-dark",
                      !code.match(/20[0-9]/) &&
                        "bg-medusa-tag-red-bg dark:bg-medusa-tag-red-bg-dark text-medusa-tag-red-text dark:text-medusa-tag-red-text-dark"
                    )}
                  >
                    {code} {response.description}
                  </summary>

                  <>
                    <div
                      className={clsx(
                        "border-medusa-border-base dark:border-medusa-border-base-dark border-b border-solid",
                        "mb-1"
                      )}
                    >
                      <span className={clsx("uppercase")}>
                        Response Schema:
                      </span>{" "}
                      {Object.keys(response.content)[0]}
                    </div>
                    <TagOperationParameters
                      schemaObject={
                        response.content[Object.keys(response.content)[0]]
                          .schema
                      }
                    />
                  </>
                </details>
              )}
              {!response.content && (
                <div>
                  {code} {response.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Suspense>
  )
}

export default TagOperation