import { View, Text, ColorValue, StyleProp, ViewStyle } from "react-native";

interface Props {
  titulo?: string;
  subTitulo?: string;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  backgroundColor?: ColorValue;
  faixaEsquerda?: {
    mostrar: boolean;
    backgroundColor: ColorValue;
  };
  faixaDireita?: {
    mostrar: boolean;
    backgroundColor: ColorValue;
  };
  style?: StyleProp<ViewStyle>;
}

export default function Card({
  titulo,
  subTitulo,
  children,
  iconRight,
  backgroundColor,
  faixaEsquerda,
  faixaDireita,
  style,
}: Props) {
  return (
    <View
      style={[
        {
          gap: 5,
        },
        style,
      ]}
    >
      {(titulo || subTitulo || iconRight) && (
        <View
          style={{
            gap: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {(titulo || subTitulo) && (
            <View style={{ gap: 3 }}>
              {titulo && (
                <Text
                  numberOfLines={1}
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
                  numberOfLines={2}
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
          {iconRight && (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {iconRight}
            </View>
          )}
        </View>
      )}
      <View
        style={{
          overflow: "hidden",
          borderRadius: 10,
          backgroundColor: backgroundColor || "#fff",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {faixaEsquerda && faixaEsquerda.mostrar && (
          <View
            style={{
              backgroundColor: faixaEsquerda.backgroundColor,
              height: "100%",
              width: 5,
            }}
          />
        )}
        <View
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingLeft:
              faixaEsquerda && faixaEsquerda.mostrar ? undefined : 10,
            paddingRight: faixaDireita && faixaDireita.mostrar ? undefined : 10,
          }}
        >
          {children}
        </View>
        {faixaDireita && faixaDireita.mostrar && (
          <View
            style={{
              backgroundColor: faixaDireita.backgroundColor,
              height: "100%",
              width: 5,
            }}
          />
        )}
      </View>
    </View>
  );
}
