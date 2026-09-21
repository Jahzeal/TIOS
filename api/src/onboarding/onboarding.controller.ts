import { Controller, Post, Body, Inject } from '@nestjs/common';
import {
  OnboardingService,
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStep5Dto,
  OnboardingStep6Dto,
  SimulationMessageDto,
} from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(@Inject(OnboardingService) private readonly onboardingService: OnboardingService) {}

  @Post('step1')
  step1(@Body() body: OnboardingStep1Dto) {
    return this.onboardingService.saveStep1(body);
  }

  @Post('step2')
  step2(@Body() body: OnboardingStep2Dto) {
    return this.onboardingService.saveStep2(body);
  }

  @Post('step3')
  step3(@Body() body: OnboardingStep3Dto) {
    return this.onboardingService.saveStep3(body);
  }

  @Post('step4')
  step4(@Body() body: OnboardingStep4Dto) {
    return this.onboardingService.saveStep4(body);
  }

  @Post('step5')
  step5(@Body() body: OnboardingStep5Dto) {
    return this.onboardingService.saveStep5(body);
  }

  @Post('step6')
  step6(@Body() body: OnboardingStep6Dto) {
    return this.onboardingService.saveStep6(body);
  }

  @Post('step9/test-call')
  simulateCall(@Body() body: SimulationMessageDto) {
    return this.onboardingService.simulateCallTurn(body);
  }
}
