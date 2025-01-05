import React, { forwardRef } from 'react'
import { Select as TamaguiSelect, styled } from 'tamagui'

const StyledSelect = styled(TamaguiSelect, {
  backgroundColor: '$surface1',
  borderRadius: 12,
})

const SelectTrigger = styled(TamaguiSelect.Trigger, {
  backgroundColor: '$surface1',
  borderRadius: 12,
  height: 44,
  paddingHorizontal: 16,
})

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  items: Array<{
    value: string
    label: string
  }>
  placeholder?: string
}

export const Select = forwardRef<any, SelectProps>(({ 
  value, 
  onValueChange, 
  items,
  placeholder = 'Select an option...'
}, ref) => {
  return (
    <StyledSelect
      ref={ref}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger>
        <TamaguiSelect.Value placeholder={placeholder} />
      </SelectTrigger>
      <TamaguiSelect.Content>
        {items.map((item, index) => (
          <TamaguiSelect.Item 
            key={item.value}
            index={index} 
            value={item.value}
          >
            <TamaguiSelect.ItemText>{item.label}</TamaguiSelect.ItemText>
          </TamaguiSelect.Item>
        ))}
      </TamaguiSelect.Content>
    </StyledSelect>
  )
})
