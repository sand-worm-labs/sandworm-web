import { InfinityPaginationResponse } from '../infinity-pagination-response.dto';

class Widget {
  id: string;
}

describe('InfinityPaginationResponse', () => {
  it('names the generated class after the wrapped type', () => {
    const PaginatedWidget = InfinityPaginationResponse(Widget);

    expect(PaginatedWidget.name).toBe('InfinityPaginationWidgetResponseDto');
  });

  it('produces a class whose instances carry data and hasNextPage', () => {
    const PaginatedWidget = InfinityPaginationResponse(Widget) as any;
    const instance = new PaginatedWidget();
    instance.data = [{ id: '1' }];
    instance.hasNextPage = true;

    expect(instance.data).toEqual([{ id: '1' }]);
    expect(instance.hasNextPage).toBe(true);
  });

  it('generates a distinct class name per wrapped type', () => {
    class Gadget {
      id: string;
    }

    const PaginatedWidget = InfinityPaginationResponse(Widget);
    const PaginatedGadget = InfinityPaginationResponse(Gadget);

    expect(PaginatedWidget.name).not.toBe(PaginatedGadget.name);
  });
});
