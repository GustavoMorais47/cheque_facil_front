import { View, Text, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import moment from "moment";
import Button from "../button";

const plataforma = Platform.OS;

interface IProps {
  data: Date;
  setData: (value: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export default function DataPicker({
  data,
  setData,
  minimumDate,
  maximumDate,
  disabled = false,
}: IProps) {
  const [mostrar, setMostrar] = useState<boolean>();
  return (
    <View>
      {plataforma === "ios" && (
        <DateTimePicker
          value={moment(data).toDate()}
          onChange={(event, selectedDate) => {
            event.type === "set" && selectedDate && setData(selectedDate);
          }}
          accentColor="#399b53"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          dateFormat="shortdate"
          themeVariant="light"
          textColor="#399b53"
          locale="pt-BR"
          disabled={disabled}
        />
      )}
      {plataforma === "android" && (
        <>
          <View
            style={{
              alignSelf: "flex-end",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text>{moment(data).format("DD/MM/YYYY")}</Text>
            <View>
            <Button
              titulo="Alterar"
              onPress={() => setMostrar(true)}
              type="primary"
              disabled={disabled}
            />
            </View>
          </View>
          {mostrar && (
            <DateTimePicker
              value={moment(data).toDate()}
              onChange={(event, selectedDate) => {
                event.type === "set" && selectedDate && setData(selectedDate);
                setMostrar(false);
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              accentColor="#399b53"
              dateFormat="shortdate"
              themeVariant="light"
              textColor="#399b53"
              locale="pt-BR"
            />
          )}
        </>
      )}
    </View>
  );
}
