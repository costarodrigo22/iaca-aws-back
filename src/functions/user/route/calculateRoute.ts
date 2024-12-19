import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import {
  CalculateRouteCommand,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";
import { locationClient } from "../../../libs/locationClient";
import { response } from "../../../utils/response";
import { calculateFreightRate } from "../../../utils/calculateFreightRate";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const { origin, destination } = bodyParser(event.body);

    const addressOriginText = `${origin.street}, ${origin.neighborhood}, ${origin.city}, ${origin.state}, ${origin.country}`;

    const addressDestinationText = `${destination.street}, ${destination.neighborhood}, ${destination.city}, ${destination.state}, ${destination.country}`;

    const paramsOriginPlaceIndex = {
      IndexName: "ChaparralPlaceIndex",
      Text: addressOriginText,
    };

    const paramsDestinationPlaceIndex = {
      IndexName: "ChaparralPlaceIndex",
      Text: addressDestinationText,
    };

    const commandOrigin = new SearchPlaceIndexForTextCommand(
      paramsOriginPlaceIndex
    );

    const commandDestination = new SearchPlaceIndexForTextCommand(
      paramsDestinationPlaceIndex
    );

    const originCoord = await locationClient.send(commandOrigin);

    const destinationCoord = await locationClient.send(commandDestination);

    if (!originCoord.Results?.length || !destinationCoord.Results?.length) {
      return response(400, {
        message: "Não foi possível obter as coordenadas do endereço.",
      });
    }

    const paramsCalculateRoute = {
      CalculatorName: "ChaparralRouteCalculator", // Certifique-se de criar um Route Calculator
      DeparturePosition: originCoord.Results[0].Place?.Geometry?.Point,
      DestinationPosition: destinationCoord.Results[0].Place?.Geometry?.Point,
      TravelMode: "Car" as const,
    };

    const commandRoute = new CalculateRouteCommand(paramsCalculateRoute);

    const route = await locationClient.send(commandRoute);

    const distance = route.Summary?.Distance ?? 0;
    const duration = route.Summary?.DurationSeconds ?? 0;

    const freightValue = calculateFreightRate(distance);

    if (freightValue === -1) {
      return response(400, {
        message: "Distância fora da faixa permitida para cálculo do frete.",
      });
    }

    return response(200, {
      distance: `${distance.toFixed(2)} km`,
      duration: `${Math.ceil(duration / 60)} minutos`,
      freightValue: Number(freightValue.toFixed(2)),
    });
  } catch (error) {
    return response(500, {
      message: "internal server error",
      error,
    });
  }
}
