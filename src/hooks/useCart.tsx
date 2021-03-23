import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {           
      const addProductToCartStock = await api.get<Stock>(`stock/${productId}`)
        .then(response => response.data);

      const addProductTocart = await api.get<Product>(`products/${productId}`)
        .then(response => response.data);

      if(cart.some(product => product.id === productId)){
        const productIndex = cart.findIndex(product => product.id === productId);

        if(cart[productIndex].amount + 1 <= addProductToCartStock.amount){
          return updateProductAmount({
            productId,
            amount: cart[productIndex].amount + 1
          })
        }
        else{
          toast.error('Quantidade solicitada indisponível!');
        }        
      }
      else{
        setCart([...cart, {...addProductTocart, amount: 1}])

        toast.done('Produto adicionado ao carrinho!');

        return localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      }
           
    } catch {
      toast.error('Erro ao adicionar produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
