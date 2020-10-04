module.exports = class ScheduleControllers {
  // Todas as funções são com relação ao ponto médio da melatonina

  oneHourAerobicExercisePRC = [0, -0.0002737, 0.0007096, 0.04327, -0.06959, -0.8871]
  oneHourAerobicExercisePRCDervative = [0, -0.0010948, -0.0021288, 0.08654, -0.06959]
  oneHourAerobicExercisePRCDervative2 = [0, -0.0032844, -0.0042576, 0.08654]
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
  FinderNewtonMethod(initial_value, value, func, derivative){
    const iterations = 10
    const x0 = initial_value
    let x = 0
    for(let i = 0; i < iterations; i++) {
      if (i === 0){
        x = x0
      }
      else {
        x = x - (func(x)-value)/derivative(x)
      }
      return x
    }
  }

  calculateMelatoninMidpoint({sleep_start}){
    // sleep start is on average about 2 hours after urinal melatonin metabolites begin to appear in urine, under dim light conditions
    currentDate = new Date()
    const melatonin_onset_hour = sleep_start.getUTCHours() - 2
    const melatonin_onset = Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), this.currentDate.getUTCDate(), melatonin_onset_hour, this.currentDate.getUTCMinutes(), this.currentDate.getUTCSeconds(), this.currentDate.getUTCMilliseconds())

  }
//Como a curva é necessariamente periódica (o polinômio se repete a cada 24h), há garantia que se há horas de delay e advance na mesma função, é provável que haja horas de delay mímimas e de advance máximas contidas no intervalo
  calculateCriticalShiftHour(derivative, derivative2, type){
    for(let intial = -12; initial < 12; initial++) {
      critical_x = FinderNewtonMethod(initial, 0, derivative, derivative2)
      critical_point = this.calculatePRC(critical_x, parameters)
      switch(type) {
        case 'delay':
          if (critical_point < 0){
            return critical_x
          }
          break;
        case 'advance':
          if (critical_point >= 0){
            return critical_x
          }
          break;
      }
    }
    switch(type) {
      case 'delay':
        throw 'A função não apresenta hora de delay'
        break;
      case 'advance':
        throw 'A função não apresenta hora de advance'
        break;
    }
  }
  // INTENDED SLEEP TIME É UM datetime TAMBÉM
  // type é uma string, 'delay' ou 'advance'
  // calculateCurrentShift só funciona pra funções com picos acima de shift = 0 e vales abaixo de shift = 0, ou seja, não funciona para a droga PF670462


  calculateCurrentShift({intended_sleep_time}, {sleep_start}, {target_date}, parameters, derivative, derivative2){
    currentDate = new Date()
    const desiredShiftHours = sleep_start.getUTCHours() - intended_sleep_time.getUTCHours()
    const desiredShiftMinutes = sleep_start.getUTCMinutes() - intended_sleep_time.getUTCMinutes()
    let currentShift = 0
    let shiftRemainder = 0
    const minimumShift = this.calculatePRC(this.calculateCriticalShiftHours(derivative, derivative2, 'delay'), parameters)
    const maximumShift = this.calculatePRC(this.calculateCriticalShiftHours(derivative, derivative2, 'advance'), parameters)
    if (desiredShiftHours < 0){
      const decimalShift = desiredShiftHours - Math.abs(desiredShiftMinutes/60)
      if (minimumShift < desiredShiftHours) {
        currentShift = decimalShift
        shiftRemainder = 0
      }
      else {
        currentShift = minimumShift
        shiftRemainder = decimalShift - minimumShift
      }
    }
    if (desiredShiftHours > 0){
      const decimalShift = desiredShiftHours + Math.abs(desiredShiftMinutes/60)
      if (maximumShift > desiredShiftHours) {
        currentShift = decimalShift
        shiftRemainder = 0
      }
      else {
        currentShift = maximumShift
        shiftRemainder = decimalShift - minimumShift
      }
    if (desiredShiftHours === 0){
      if (desiredShiftMinutes < 0){
        
      }
      else {
        
      }
    }
    }
    return currentShift
  }
  // shifterProportions: array de fatores de mudança no horário do sono
  // O formato de shifterProportions é: [Melatonin 3mg proportion (float), Melatonin 0.5 mg proportion (float), 1h of Aerobic Exercise proportion (float)]
  // proporção 1 + proporção 2 + proporção 3 = 1.

  calculateTimes(selectedShifters, shifterProportions, parameters, type, desiredShift){
    switch(type){
      case 'delay':
        if(selectedShifters.includes('1h of Aerobic Exercise')){
          oneHourAerobicExerciseShift = this.calculateCriticalShiftHour(this.oneHourAerobicExercisePRCDervative, this.oneHourAerobicExercisePRCDervative2, 'delay')
        }
        if(selectedShifters.includes('Melatonin 0.5mg')){f
          melatoninHalfMgShift = this.calculateCriticalShiftHour(this.melatoninExposurePRChalfMgDerivative, this.melatoninExposurePRChalfMgDerivative2, 'delay')
        }
        if(selectedShifters.includes('Melatonin 3mg')){
          melatonin3MgShift = this.calculateCriticalShiftHour(this.melatoninExposurePRC3mgDerivative, this.melatoninExposurePRC3mgDerivative2, 'delay')
        }
        break;
      case 'advance':
        if(selectedShifters.includes('1h of Aerobic Exercise')){
          oneHourAerobicExerciseShift = this.calculateCriticalShiftHour(this.oneHourAerobicExercisePRCDervative, this.oneHourAerobicExercisePRCDervative2, 'delay')
        }
        break;
    }
    // Subjective times are relative to user's DLMO (Dim-Light Melatonin Onset)
    melatoninHalfMgSubjectiveTime = 
  }
}
