"use client"

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as RHFFormField,
} from "@workspace/ui/components/form"
import React from "react"
import {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form"

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label?: string
  description?: string
  required?: boolean
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>
  }) => React.ReactElement
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  const fieldProps = {
    control,
    name,
    render: ({
      field,
    }: {
      field: ControllerRenderProps<TFieldValues, TName>
    }) => (
      <FormItem>
        {label && (
          <FormLabel>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>
        )}
        <FormControl>{render({ field })}</FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    ),
  } as const

  return <RHFFormField {...(fieldProps as any)} />
}
