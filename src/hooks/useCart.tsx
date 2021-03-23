import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { setTokenSourceMapRange } from 'typescript';
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
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {           
      const addProductToCartStock = await api.get<Stock>(`stock/${productId}`)
        .then(response => response.data);

      const addProductTocart = await api.get<Product>(`products/${productId}`)
        .then(response => response.data);

      const productExist = cart.find(product => product.id === productId);

      if(!productExist && addProductToCartStock.amount > 0){
        setCart([...cart, {...addProductTocart, amount: 1}]);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      }
      else if(productExist && productExist.amount + 1 <= addProductToCartStock.amount){
        updateProductAmount({
          productId,
          amount: productExist.amount + 1
        });
      }
      else{
        toast.error('Quantidade solicitada indisponível!');
      }
    } catch {
      toast.error('Erro ao adicionar produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(product => product.id === productId);
      
      if(productExists){
        setCart(cart.filter(product => product.id !== productId));

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      }      
    } catch {
      toast.error('Erro ao remover produto!')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await api.get<Stock>(`stock/${productId}`)
        .then(response => response.data);

      if(amount < 1){
        return;
      }
      else if(amount <= productStock.amount){
        const updateProductCart = cart.map(product => 
          product.id === productId
            ? {...product, amount}
            : product
        )

        setCart(updateProductCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateProductCart));
      }
      else{
        toast.error('Quantidade solicitada indisponível!');        
      }

    } catch {
      toast.error('Erro ao adicionar produto');
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
