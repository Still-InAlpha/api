module.exports = class ScheduleControllers {
  // Todas as funções são com relação ao DLMO (Dim light melatonin onset)

  oneHourAerobicExercisePRC = [0, -0.0002737, 0.0007096, 0.04327, -0.06959, -0.8871]
  oneHourAerobicExercisePRCDerivative = [0, -0.0010948, -0.0021288, 0.08654, -0.06959]
  oneHourAerobicExercisePRCDerivative2 = [0, -0.0032844, -0.0042576, 0.08654]
  // FOR 3 miligrams of Melatonin
  melatoninExposurePRC3mg = [1.978*10**(-5), -0.0003338, 0.0002579, 0.01488, -0.1938, 0.5724]
  melatoninExposurePRC3mgDerivative = [0.0000989, -0.0013352, 0.0007737, 0.02976, -0.1938]
  melatoninExposurePRC3mgDerivative2 = [0.0003956, -0.0040056, 0.0015474, 0.02976]
  // FOR 0.5 miligrams of Melatonin
  melatoninExposurePRChalfMg = [6.483*10**(-6), -0.0001461, 0.0009397, -0.006082, -0.07612, 0.7703]
  melatoninExposurePRChalfMgDerivative = [0.000032415, -0.0005844, 0.0028191, -0.012164, -0.07612]
  melatoninExposurePRChalfMgDerivative2 = [0.00012966, -0.0017532, 0.0056382, -0.012164]

  // sumArrays(arrayArray){
  //   let arrFinal = arrayArray[0]
  //   for (let j = 1; j < arrayArray.length; j++){
  //     for (let i = 0; i < arrayArray[0].length; i++){
  //       arrFinal[i] = arrFinal[i] + arrayArray[j][i]
  //     }

  //   }
  //   return arrFinal
  // }

  calculatePRC(hour, parameters){
    polynomial_sum = 0
    for (let i = parameters.length - 1; i >= 0; i--){
      polynomial_sum += parameter[i]*hour**i
    }
    return polynomial_sum
  }

  // FOR 0.5 miligrams of Melatonin
  FinderNewtonMethod(initial_value, y_value, func, derivative){
    const iterations = 10
    const x0 = initial_value
    let x = 0
    for(let i = 0; i < iterations; i++) {
      if (i === 0){
        x = x0
      }
      else {
        x = x - (func(x)-y_value)/derivative(x)
      }
      return x
    }
  }

  calculateMelatoninOnsetHour({sleep_start}){
    // sleep start is on average about 2 hours after urinal melatonin metabolites begin to appear in urine, under dim light conditions
    const melatonin_onset_hour = parseInt(sleep_start.split(':')[0]) - 2
    const melatonin_onset_minute = parseInt(sleep_start.split(':')[1])
    const melatonin_onset = melatonin_onset_hour + melatonin_onset_minute/60
    return melatonin_onset
  }
//Como a curva é necessariamente periódica (o polinômio se repete a cada 24h), há garantia que se há horas de delay e advance na mesma função, é provável que haja horas de delay mímimas e de advance máximas contidas no intervalo. Vamos assumir que tal possibilidade seja verdade
  calculateCriticalShiftHour(derivative, derivative2, type){
    for(let intial = -12; initial < 12; initial++) {
      critical_x = FinderNewtonMethod(initial, 0, derivative, derivative2)
      critical_point = this.calculatePRC(critical_x, parameters)
      switch(type) {
        case 'delay':
        // mínimo local abaixo de 0
          if (critical_point < 0){
            if (this.calculatePRC(critical_x, derivative2) > 0 && critical_x >= -12 && critical_x < 12){
              return critical_x
            }
          }
          break;
        case 'advance':
        // máximo local acima de 0
          if (critical_point >= 0){
            if (this.calculatePRC(critical_x, derivative2) < 0 && critical_x >= -12 && critical_x < 12){
              return critical_x
            }
          }
          break;
      }
    }
    switch(type) {
      case 'delay':
        throw 'A função não apresenta hora minima de delay no intervalo de 24h'
        break;
      case 'advance':
        throw 'A função não apresenta hora minima de advance no intervalo de 24h'
        break;
    }
  }
  // INTENDED SLEEP TIME É UM datetime TAMBÉM
  // type é uma string, 'delay' ou 'advance'
  // calculateCurrentShift só funciona pra funções com picos acima de shift = 0 e vales abaixo de shift = 0, ou seja, não funciona para a droga PF670462

  // hours no formato '00:45'
  calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, parameters, derivative, derivative2, work_start, work_end){
    currentDate = new Date()
    const desiredShiftHours = parseInt(sleep_start.split(':')[0]) - parseInt(intended_sleep_time.split(':')[0])
    const desiredShiftMinutes = parseInt(sleep_start.split(':')[1]) - parseInt(intended_sleep_time.split(':')[1])
    let currentShift = 0
    let shiftRemainder = 0
    let shiftHour
    const minimumShiftHour = this.calculateCriticalShiftHours(derivative, derivative2, 'delay')
    const maximumShiftHour = this.calculateCriticalShiftHours(derivative, derivative2, 'advance')
    const minimumShift = this.calculatePRC(minimumShiftHour, parameters)
    const maximumShift = this.calculatePRC(maximumShiftHour, parameters)
    if (desiredShiftHours <= 0){
      let decimalShift = desiredShiftHours - Math.abs(desiredShiftMinutes/60)
      if (minimumShift < decimalShift) {
        currentShift = decimalShift
        shiftRemainder = 0
        shiftHour = this.FinderNewtonMethod(maximumShiftHour, decimalShift, parameters, derivative)
      }
      else {
        currentShift = minimumShift
        shiftRemainder = decimalShift - minimumShift
        shiftHour =  minimumShiftHour
      }
    }
    if (desiredShiftHours > 0) {
      let decimalShift = desiredShiftHours + Math.abs(desiredShiftMinutes/60)
      if (maximumShift > decimalShift) {
        currentShift = decimalShift
        shiftRemainder = 0
        shiftHour = this.FinderNewtonMethod(maximumShiftHour, decimalShift, parameters, derivative)
      }
      else {
        currentShift = maximumShift
        shiftRemainder = decimalShift - minimumShift
        shiftHour = maximumShiftHour
      }
    }
    return [currentShift, shiftHour, shiftRemainder]
  }

  // shifterProportions: array de fatores de mudança no horário do sono
  // O formato de shifterProportions é: [Melatonin 3mg proportion (float), Melatonin 0.5 mg proportion (float), 1h of Aerobic Exercise proportion (float)]
  // proporção 1 + proporção 2 + proporção 3 = 1.

  calculateTimes(selectedShifters, shifterProportions, parameters, type, intended_sleep_time, sleep_start, work_start, work_end){
      if(selectedShifters.includes('1h of Aerobic Exercise')){
        oneHourAerobicExerciseShift = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.oneHourAerobicExercisePRC, this.oneHourAerobicExercisePRCDerivative, this.oneHourAerobicExercisePRCDerivative2, work_start, work_end)[0]
        oneHourAerobicExerciseShiftHour = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.oneHourAerobicExercisePRC, this.oneHourAerobicExercisePRCDerivative, this.oneHourAerobicExercisePRCDerivative2, work_start, work_end)[1]
        oneHourAerobicExerciseShiftRemainder = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.oneHourAerobicExercisePRC, this.oneHourAerobicExercisePRCDerivative, this.oneHourAerobicExercisePRCDerivative2, work_start, work_end)[2]
      }
      if(selectedShifters.includes('Melatonin 0.5mg')){f
        melatoninExposureHalfMgShift = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRChalfMg, this.melatoninExposurePRChalfMgDerivative, this.melatoninExposurePRChalfMgDerivative2, work_start, work_end)[0]
        melatoninExposureHalfMgShiftHour = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRChalfMg, this.melatoninExposurePRChalfMgDerivative, this.melatoninExposurePRChalfMgDerivative2, work_start, work_end)[1]
        melatoninExposureHalfMgShiftRemainder = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRChalfMg, this.melatoninExposurePRChalfMgDerivative, this.melatoninExposurePRChalfMgDerivative2, work_start, work_end)[2]
      }
      if(selectedShifters.includes('Melatonin 3mg')){
        melatoninExposure3mgShift = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRC3mg, this.melatoninExposurePRC3mgDerivative, this.melatoninExposurePRC3mgDerivative2, work_start, work_end)[0]
        melatoninExposure3mgShiftHour = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRC3mg, this.melatoninExposurePRC3mgDerivative, this.melatoninExposurePRC3mgDerivative2, work_start, work_end)[1]
        melatoninExposure3mgShiftRemainder = calculateCurrentShiftAndHour(intended_sleep_time, sleep_start, this.melatoninExposurePRC3mg, this.melatoninExposurePRC3mgDerivative, this.melatoninExposurePRC3mgDerivative2, work_start, work_end)[2]
      }

    // Subjective times are relative to user's DLMO (Dim-Light Melatonin Onset)
    melatonin_onset
  }
}
