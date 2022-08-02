import { IdMap, MockManager, MockRepository } from "medusa-test-utils"
import { EventBusService } from "../index"
import { Currency } from "../../models"
import CurrencyService from "../currency";
import { FlagRouter } from "../../utils/flag-router";
import TaxInclusiveFeatureFlag from "../../loaders/feature-flags/tax-inclusive";

const currencyCode = IdMap.getId("currency-1")
const eventBusServiceMock = {
  emit: jest.fn(),
  withTransaction: function() {
    return this
  },
} as unknown as EventBusService
const currencyRepositoryMock = MockRepository({
  findOne: jest.fn().mockImplementation(() => {
    return {
      code: currencyCode
    }
  }),
  save: jest.fn().mockImplementation((data) => {
    return Object.assign(new Currency(), data)
  })
})


describe('CurrencyService', () => {
  const currencyService = new CurrencyService({
    manager: MockManager,
    currencyRepository: currencyRepositoryMock,
    eventBusService: eventBusServiceMock,
    featureFlagRouter: new FlagRouter({
      [TaxInclusiveFeatureFlag.key]: true
    }),
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should retrieve the currency by calling the repository findOne method", async () => {
    await currencyService.retrieve(currencyCode)
    expect(currencyRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { code: currencyCode },
    })
  })

  it("should update the currency by calling the save method", async () => {
    await currencyService.update(currencyCode, {
      includes_tax: true,
    })
    expect(currencyRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { code: currencyCode },
    })
    expect(currencyRepositoryMock.save).toHaveBeenCalledWith({
      code: currencyCode,
      includes_tax: true,
    })
  })
})