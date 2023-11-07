import React from "react";
import {
  KeyboardTypeOptions,
  TextInput,
  View,
  Text,
  ColorValue,
  Platform,
} from "react-native";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  maxLength?: number;
  title?: string;
  subTitle?: string;
  titleColor?: ColorValue;
  secureTextEntry?: boolean;
  numberOfLines?: number;
  textAlign?: "left" | "center" | "right";
  textAlignVertical?: "top" | "center" | "bottom";
  disabled?: boolean;
}

export default function Input({
  text,
  onChangeText,
  keyboardType,
  placeholder,
  iconLeft,
  iconRight,
  maxLength,
  title,
  subTitle,
  titleColor,
  secureTextEntry,
  numberOfLines,
  textAlign,
  textAlignVertical,
  disabled = false,
}: Props) {
  return (
    <View
      style={{
        gap: 5,
      }}
    >
      {(title || subTitle) && (
        <View style={{ gap: 2 }}>
          {title && (
            <Text
              style={{
                fontWeight: "bold",
                color: titleColor,
              }}
            >
              {title}
            </Text>
          )}
          {subTitle && (
            <Text
              style={{
                fontWeight: "300",
                fontSize: 12,
                color: titleColor,
              }}
            >
              {subTitle}
            </Text>
          )}
        </View>
      )}
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.08)",
          borderRadius: 10,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 5,
        }}
      >
        {iconLeft && (
          <View
            style={{
              height: 20,
              width: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {iconLeft}
          </View>
        )}
        <TextInput
          editable={!disabled}
          value={text}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          numberOfLines={numberOfLines}
          textAlign={textAlign}
          textAlignVertical={textAlignVertical}
          style={{
            flex: 1,
            paddingVertical: Platform.OS === "ios" ? 10 : 5,
            color: disabled ? "#aaa" : "#000",
          }}
        />
        {iconRight && (
          <View
            style={{
              height: 20,
              width: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {iconRight}
          </View>
        )}
      </View>
    </View>
  );
}
