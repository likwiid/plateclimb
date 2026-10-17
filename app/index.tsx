// SPDX-License-Identifier: GPL-3.0-or-later
import { Redirect } from "expo-router";
import { routes } from "@shared/constants/routes";

export default function Index() {
  return <Redirect href={routes.tabs} />;
}
