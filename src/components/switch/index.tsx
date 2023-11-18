import React from "react";
import { TouchableOpacity, View, Text, ColorValue } from "react-native";

export interface IOpcao {
  label: string;
  value: number | string;
}

interface Props {
  opcoes: IOpcao[];
  selecionado: number | null;
  setSelecionado: (index: number | null) => void;
  titulo?: string;
  subTitulo?: string;
  backgroundColor?: ColorValue;
  disabled?: boolean;
  desmarcar?: boolean;
}

export default function Switch({
  opcoes,
  selecionado,
  setSelecionado,
  titulo,
  subTitulo,
  backgroundColor,
  disabled = false,
  desmarcar = false,
}: Props) {
  return (
    <View
      style={{
        gap: 5,
      }}
    >
      {(titulo || subTitulo) && (
        <View style={{ gap: 3 }}>
          {titulo && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {titulo}
            </Text>
          )}
          {subTitulo && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "300",
              }}
            >
              {subTitulo}
            </Text>
          )}
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: backgroundColor || "#fff",
          gap: 5,
          flexWrap: "wrap",
        }}
      >
        {opcoes.length > 0 ? (
          opcoes.map((opcao, index) => {
            return (
              <TouchableOpacity
                key={index}
                disabled={
                  disabled ? disabled : !desmarcar && selecionado === index
                }
                style={{
                  flex: 1,
                  backgroundColor:
                    selecionado === index ? "#399b53" : "rgba(0,0,0,0.02)",
                  paddingHorizontal: 10,
                  height: 40,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "25%",
                }}
                onPress={() => {
                  if (desmarcar && selecionado === index) {
                    setSelecionado(null);
                  } else {
                    setSelecionado(index);
                  }
                }}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    color: selecionado === index ? "#fff" : "#000",
                    fontWeight: selecionado === index ? "bold" : "normal",
                    textTransform: "capitalize",
                    textAlign: "center",
                  }}
                >
                  {opcao.label}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text
            style={{
              fontWeight: "300",
            }}
          >
            Não há opções
          </Text>
        )}
      </View>
    </View>
  );
}
