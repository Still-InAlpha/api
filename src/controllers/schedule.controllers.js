module.exports = class ScheduleControllers {
  // Todas as funções são com relação ao ponto médio da melatonina

  

  oneHourAerobicExercisePRC = [0, -0.0002737, 0.0007096, 0.04327, -0.06959, -0.8871]
  oneHourAerobicExercisePRCDervative = [0, -0.0010948, -0.0021288, 0.08654, -0.06959]
  // FOR 3 miligrams of Melatonin
  melatoninExposurePRC3mg = [1.978*10**(-5), -0.0003338, 0.0002579, 0.01488, -0.1938, 0.5724]
  melatoninExposurePRC3mgDerivative = [0.0000989, -0.0013352, 0.0007737, 0.02976, -0.1938]
  // FOR 0.5 miligrams of Melatonin
  melatoninExposurePRChalfMg = [6.483*10**(-6), -0.0001461, 0.0009397, -0.006082, -0.07612, 0.7703]
  melatoninExposurePRChalfMgDerivative = [0.000032415, -0.0005844, 0.0028191, -0.012164, -0.07612]

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
    for (let i = 0; i < parameters.length; i++){
      polynomial_sum += parameter[i]*hour**i
    }
    return polynomial_sum
  }

  
  // FOR 0.5 miligrams of Melatonin
  yFinderNewtonMethod(value, func, derivative){
    const iterations = 2
    const x0 = 0.5
    let x = 0
    for(let i = 0; i < iterations; i++){
      if (i === 0){
        x = x0
      }
      else{
        x = x - (func(x)-value)/derivative(x)
      }
    }
  }

  calculateMelatoninMidpoint({sleep_start}){
    // sleep start is on average about 2 hours after urinal melatonin metabolites begin to appear in urine, under dim light conditions
    currentDate = new Date()
    const melatonin_onset_hour = sleep_start.getUTCHours() - 2
    const melatonin_onset = Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), this.currentDate.getUTCDate(), melatonin_onset_hour, this.currentDate.getUTCMinutes(), this.currentDate.getUTCSeconds(), this.currentDate.getUTCMilliseconds())

  }

  calculateCurrentShift({intended_sleep_time}, {sleep_start}, {target_date}){
    currentDate = new Date()
    const days = Math.abs(targetDate - currentDate)/(1000*60*60*24)
    const desiredShift = Math.abs(sleep_start - intended_sleep_time)/(1000*60*60)
    const desiredShift = desiredShift/days
    return desiredCurrentShift

  }
  // shifterProportions: objeto de fatores de mudança no horário do sono
  // O formato de shifterProportions é: [Melatonin 3mg proportion (float), Melatonin 0.5 mg proportion (float), 1h of Aerobic Exercise proportion (float)]
  // proporção 1 + proporção 2 + proporção 3 = 1.
  calculateTimes(selectedShifters, shifterProportions){
    if(selectedShifters.includes('1h of Aerobic Exercise')){
      oneHourAerobicExerciseShift = shifterProportions[2]*calculateCurrentShift(body.intended_sleep_time, currentDate, body.sleep_start, body.target_date)
    }
    if(selectedShifters.includes('Melatonin 3mg')){
      melatonin3MgShift = shifterProportions[0]*calculateCurrentShift(body.intended_sleep_time, currentDate, body.sleep_start, body.target_date)
    }
    if(selectedShifters.includes('Melatonin 0.5mg')){
      melatoninHalfMgShift = shifterProportions[1]*calculateCurrentShift(body.intended_sleep_time, currentDate, body.sleep_start, body.target_date)
    }
    // Subjective times are relative to user's DLMO (Dim-Light Melatonin Onset)
    melatoninHalfMgSubjectiveTime = 
  }
