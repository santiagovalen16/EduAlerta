import { Module } from "@nestjs/common";
import { TerritorialController } from "./territorial.controller";
import { TerritorialRepository } from "./territorial.repository";
import { TerritorialService } from "./territorial.service";

@Module({
  controllers: [TerritorialController],
  providers: [TerritorialService, TerritorialRepository]
})
export class TerritorialModule {}
